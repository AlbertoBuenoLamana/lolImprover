from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/champion-pools",
    tags=["champion pools"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.ChampionPool, status_code=status.HTTP_201_CREATED)
def create_champion_pool(
    champion_pool: schemas.ChampionPoolCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new champion pool"""
    db_pool = models.ChampionPool(
        name=champion_pool.name,
        description=champion_pool.description,
        category=champion_pool.category,
        user_id=current_user.id
    )
    db.add(db_pool)
    db.commit()
    db.refresh(db_pool)
    
    # Add champions if provided
    if champion_pool.champions:
        for champion in champion_pool.champions:
            db_champion = models.ChampionPoolEntry(
                champion_id=champion.champion_id,
                champion_name=champion.champion_name,
                notes=champion.notes,
                category=champion.category if champion.category else "blind",
                pool_id=db_pool.id
            )
            db.add(db_champion)
        db.commit()
        db.refresh(db_pool)
        
    return db_pool


@router.get("/", response_model=List[schemas.ChampionPool])
def read_champion_pools(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all champion pools for the current user, optionally filtered by category"""
    query = db.query(models.ChampionPool).filter(models.ChampionPool.user_id == current_user.id)
    
    if category:
        query = query.filter(models.ChampionPool.category == category)
        
    return query.all()


@router.get("/{pool_id}", response_model=schemas.ChampionPool)
def read_champion_pool(
    pool_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific champion pool by ID"""
    db_pool = db.query(models.ChampionPool).filter(
        models.ChampionPool.id == pool_id,
        models.ChampionPool.user_id == current_user.id
    ).first()
    
    if not db_pool:
        raise HTTPException(status_code=404, detail="Champion pool not found")
        
    return db_pool


@router.put("/{pool_id}", response_model=schemas.ChampionPool)
def update_champion_pool(
    pool_id: int,
    pool_update: schemas.ChampionPoolUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a champion pool's metadata and champions"""
    db_pool = db.query(models.ChampionPool).filter(
        models.ChampionPool.id == pool_id,
        models.ChampionPool.user_id == current_user.id
    ).first()
    
    if not db_pool:
        raise HTTPException(status_code=404, detail="Champion pool not found")
    
    # Update basic pool fields
    if pool_update.name is not None:
        db_pool.name = pool_update.name
    if pool_update.description is not None:
        db_pool.description = pool_update.description
    if pool_update.category is not None:
        db_pool.category = pool_update.category
    
    # Update champions if provided
    if pool_update.champions is not None:
        # Remove existing champions
        db.query(models.ChampionPoolEntry).filter(
            models.ChampionPoolEntry.pool_id == pool_id
        ).delete()
        
        # Add new champions
        for champion in pool_update.champions:
            db_champion = models.ChampionPoolEntry(
                champion_id=champion.champion_id,
                champion_name=champion.champion_name,
                notes=champion.notes,
                category=champion.category if champion.category else "blind",
                pool_id=pool_id
            )
            db.add(db_champion)
    
    db.commit()
    db.refresh(db_pool)
    return db_pool


@router.delete("/{pool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_champion_pool(
    pool_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a champion pool"""
    db_pool = db.query(models.ChampionPool).filter(
        models.ChampionPool.id == pool_id,
        models.ChampionPool.user_id == current_user.id
    ).first()
    
    if not db_pool:
        raise HTTPException(status_code=404, detail="Champion pool not found")
    
    db.delete(db_pool)
    db.commit()
    return None


@router.post("/{pool_id}/champions", response_model=schemas.ChampionPoolEntry)
def add_champion_to_pool(
    pool_id: int,
    champion: schemas.ChampionPoolEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Add a champion to a pool"""
    # Verify pool exists and belongs to user
    db_pool = db.query(models.ChampionPool).filter(
        models.ChampionPool.id == pool_id,
        models.ChampionPool.user_id == current_user.id
    ).first()
    
    if not db_pool:
        raise HTTPException(status_code=404, detail="Champion pool not found")
    
    # Check if champion already exists in this pool
    existing_champion = db.query(models.ChampionPoolEntry).filter(
        models.ChampionPoolEntry.pool_id == pool_id,
        models.ChampionPoolEntry.champion_id == champion.champion_id
    ).first()
    
    if existing_champion:
        raise HTTPException(
            status_code=400, 
            detail=f"Champion {champion.champion_name} already exists in this pool"
        )
    
    # Add champion to pool
    db_champion = models.ChampionPoolEntry(
        champion_id=champion.champion_id,
        champion_name=champion.champion_name,
        notes=champion.notes,
        category=champion.category if champion.category else "blind",
        pool_id=pool_id
    )
    
    db.add(db_champion)
    db.commit()
    db.refresh(db_champion)
    return db_champion


@router.delete("/{pool_id}/champions/{champion_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_champion_from_pool(
    pool_id: int,
    champion_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Remove a champion from a pool"""
    # Verify pool exists and belongs to user
    db_pool = db.query(models.ChampionPool).filter(
        models.ChampionPool.id == pool_id,
        models.ChampionPool.user_id == current_user.id
    ).first()
    
    if not db_pool:
        raise HTTPException(status_code=404, detail="Champion pool not found")
    
    # Find champion in pool
    db_champion = db.query(models.ChampionPoolEntry).filter(
        models.ChampionPoolEntry.pool_id == pool_id,
        models.ChampionPoolEntry.champion_id == champion_id
    ).first()
    
    if not db_champion:
        raise HTTPException(status_code=404, detail="Champion not found in pool")
    
    db.delete(db_champion)
    db.commit()
    return None


@router.get("/champions/all", response_model=List[schemas.ChampionPoolEntry])
def get_all_pooled_champions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all champions from all pools for the current user"""
    # Find all pools belonging to the user
    user_pools = db.query(models.ChampionPool).filter(
        models.ChampionPool.user_id == current_user.id
    ).all()
    
    pool_ids = [pool.id for pool in user_pools]
    
    # Get all champions from these pools
    champions = db.query(models.ChampionPoolEntry).filter(
        models.ChampionPoolEntry.pool_id.in_(pool_ids)
    ).all()
    
    return champions


@router.get("/champions/category/{category}", response_model=List[schemas.ChampionPoolEntry])
def get_champions_by_category(
    category: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all champions from pools of a specific category"""
    # Find all pools of the specified category belonging to the user
    category_pools = db.query(models.ChampionPool).filter(
        models.ChampionPool.user_id == current_user.id,
        models.ChampionPool.category == category
    ).all()
    
    pool_ids = [pool.id for pool in category_pools]
    
    # If no pools found, return empty list
    if not pool_ids:
        return []
    
    # Get all champions from these pools
    champions = db.query(models.ChampionPoolEntry).filter(
        models.ChampionPoolEntry.pool_id.in_(pool_ids)
    ).all()
    
    return champions 