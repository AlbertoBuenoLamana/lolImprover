import axiosInstance from './axios';
import { Goal, GoalFormData } from '../types';

const GOALS_URL = '/goals/';

// Fetch all goals
export const fetchGoals = async (): Promise<Goal[]> => {
  try {
    const response = await axiosInstance.get(GOALS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

// Fetch a single goal by ID
export const fetchGoal = async (id: number): Promise<Goal> => {
  try {
    const response = await axiosInstance.get(`${GOALS_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching goal ${id}:`, error);
    throw error;
  }
};

// Create a new goal
export const createGoal = async (goalData: GoalFormData): Promise<Goal> => {
  try {
    console.log('Creating goal with data:', goalData);
    const response = await axiosInstance.post(GOALS_URL, goalData);
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

// Update an existing goal
export const updateGoal = async (id: number, goalData: GoalFormData): Promise<Goal> => {
  try {
    const response = await axiosInstance.put(`${GOALS_URL}${id}/`, goalData);
    return response.data;
  } catch (error) {
    console.error(`Error updating goal ${id}:`, error);
    throw error;
  }
};

// Delete a goal
export const deleteGoal = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${GOALS_URL}${id}/`);
  } catch (error) {
    console.error(`Error deleting goal ${id}:`, error);
    throw error;
  }
};

// Update goal status
export const updateGoalStatus = async (id: number, status: string): Promise<Goal> => {
  try {
    const response = await axiosInstance.patch(`${GOALS_URL}${id}/status/`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for goal ${id}:`, error);
    throw error;
  }
}; 