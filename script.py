import requests
import json
import pandas as pd
from datetime import datetime
import time

def fetch_and_save_data():
    # Store the user ID and service
    user_id = "66222987"
    service = "patreon"
    
    # Check if JSON file already exists
    json_file = f"{user_id}.json"
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            print(f"\nLoading existing data from {json_file}")
            all_data = json.load(f)
            return all_data, user_id
    except FileNotFoundError:
        print(f"\nNo existing file found. Fetching new data...")
        
    # Initialize variables for fetching
    all_data = []
    offset = 0
    has_more = True
    
    while has_more:
        url = f"https://kemono.su/api/v1/{service}/user/{user_id}"
        params = {'o': offset}
        headers = {'accept': 'application/json'}
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not data:
                has_more = False
                break
                
            all_data.extend(data)
            print(f"Fetched {len(data)} items at offset {offset}")
            offset += 50
            time.sleep(1)
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            break
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            break
    
    # Save raw JSON
    try:
        json_file = f"{user_id}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=4, ensure_ascii=False)
        print(f"\nRaw JSON data saved to {json_file}")
    except IOError as e:
        print(f"Error saving JSON file: {e}")
    
    return all_data, user_id

def create_excel_from_data(data, user_id):
    # Exact list of fundamental videos titles
    fundamental_titles = [
        "Snowball fundamentals",
        "Carrying 3 losing lanes Fundamentals",
        "Fundamentals to climb and how to play early (all elo's)",
        "Key Fundamentals explained to 1v9 every single game (very good vid)",
        "The Correct way to play for wincondition (MUST WATCH VID)",
        "How to COUNTER all invades.",
        "How to SMASH people in D1 elo (step by step explaining)",
        "Conditions for a gank to succeed"
    ]
    
    # Early game course titles
    early_course_titles = [
        "How to get good on Any champion (champion mastery, RLY important video)",
        "#11 Early game 1v9 course: W-W CONCEPT",
        "#10 Early game 1v9 course: BASE TIMERS",
        "#9 Early game 1v9 course: GANK EXECUTION",
        "#8 Early game 1v9 course: WHEN TO FARM WHEN TO GANK.",
        "#7 Early game 1v9 course: ADVANCED JUNGLE TRACKING",
        "#6 Early game 1v9 course: DEEP WAVES UNDERSTANDING",
        "#5 Early game 1v9 course: INVADE LIKE A KING",
        "Understanding pathing options & Winconditions - Episode 3",
        "#2 Early game 1v9 course: CHAMPION IDENTITY",
        "#1 - Early Game 1v9 course: DRAFT"
    ]
    
    # Midgame course titles
    midgame_course_titles = [
        "Baron conditions presentation",
        "Midgame course episode 7: Tempo",
        "Midgame course episode 6: Baron usage",
        "Midgame course episode 5: How to play for baron",
        "Midgame course episode 4: Recognise the objective",
        "Midgame course episode 3: Pingpong",
        "Midgame course Lesson 2: WHW Concept (very important)",
        "Midgame course Lesson 1: Drake windows and execution"
    ]
    
    # Classes titles
    classes_titles = [
        "Ganking & Playing for wincon class",
        "Drakes & How to snowball",
        "Tempo class"
    ]
    
    # Practical course titles
    practical_course_titles = [
        "How to play for wincondition & Planning - Practical course - Episode 11",
        "WW Concept - Practical course - Episode 10 (important)",
        "BASE TIMERS  - Practical course - Episode 9",
        "Practical course - Episode 8 - Rehearsal of the practical courses",
        "BEST way to GANK - Practical course - Episode 7 (insane video)",
        "When to farm when to gank - Practical course - Episode 6 (ganking jg version)",
        "When to farm when to gank - Practical course - Episode 6",
        "Perfect Jungle Tracking | Practical course - Episode 5",
        "Waves understanding and how to push | Practical course - Episode 5",
        "Art of Invading, 5 Level lead with these concepts | Practical course - Episode 4",
        "Understanding pathing options & Winconditions - Episode 3",
        "Camera control & Jungle tracking - Episode 2",
        "How to play mechanically well and predict enemy spells | Practical course - Episode 1"
    ]
    
    # Create lists to store the processed data
    processed_data = []
    fundamentals_data = []
    early_course_data = []
    midgame_course_data = []
    classes_data = []
    practical_course_data = []  # New list for practical course
    
    for item in data:
        # Main content processing remains the same
        processed_item = {
            'Added Date': item.get('added', ''),
            'Title': item.get('title', ''),
            'Content': item.get('content', '').replace('<p>', '').replace('</p>', '\n').strip(),
            'Video URL': '',  # Initialize empty
            'Published Date': item.get('published', ''),
            'Tags': str(item.get('tags', '')).replace('{', '').replace('}', ''),
            'Description': item.get('embed', {}).get('description', '') if item.get('embed') else '',
            'ID': item.get('id', '')
        }
        
        # Add video URL for .mp4 files
        if 'file' in item and item['file'].get('path', '').endswith('.mp4'):
            processed_item['Video URL'] = f"https://kemono.su{item['file']['path']}"
        elif item.get('embed') and item['embed'].get('url'):
            processed_item['Video URL'] = item['embed']['url']
        
        processed_data.append(processed_item)
        
        title = item.get('title', '').strip()
        video_url = processed_item['Video URL']
        
        # Fundamentals matching
        if any(fund_title.lower().strip() == title.lower().strip() or 
               (fund_title.lower().strip() in title.lower().strip() and 
                "snowball" in title.lower().strip())
               for fund_title in fundamental_titles):
            fundamentals_item = {
                'Title': title,
                'Published Date': item.get('published', '').split('T')[0],
                'Key Points': item.get('embed', {}).get('description', '').replace('\n\n', '\n').strip(),
                'Category': str(item.get('tags', '')).replace('{', '').replace('}', ''),
                'Video URL': video_url
            }
            fundamentals_data.append(fundamentals_item)
            
        # Early course matching
        if title in early_course_titles:
            early_course_item = {
                'Title': title,
                'Published Date': item.get('published', '').split('T')[0],
                'Key Points': item.get('embed', {}).get('description', '').replace('\n\n', '\n').strip(),
                'Video URL': video_url
            }
            early_course_data.append(early_course_item)
            
        # Midgame course matching
        if title in midgame_course_titles:
            midgame_course_item = {
                'Title': title,
                'Published Date': item.get('published', '').split('T')[0],
                'Key Points': item.get('embed', {}).get('description', '').replace('\n\n', '\n').strip(),
                'Video URL': video_url
            }
            midgame_course_data.append(midgame_course_item)
            
        # Classes matching
        if title in classes_titles:
            classes_item = {
                'Title': title,
                'Published Date': item.get('published', '').split('T')[0],
                'Key Points': item.get('embed', {}).get('description', '').replace('\n\n', '\n').strip(),
                'Video URL': video_url
            }
            classes_data.append(classes_item)
            
        # Practical course matching
        if title in practical_course_titles:
            practical_course_item = {
                'Title': title,
                'Published Date': item.get('published', '').split('T')[0],
                'Key Points': item.get('embed', {}).get('description', '').replace('\n\n', '\n').strip(),
                'Video URL': video_url
            }
            practical_course_data.append(practical_course_item)
    
    # Create DataFrames
    df = pd.DataFrame(processed_data)
    df_fundamentals = pd.DataFrame(fundamentals_data)
    df_early_course = pd.DataFrame(early_course_data)
    df_midgame_course = pd.DataFrame(midgame_course_data)
    df_classes = pd.DataFrame(classes_data)
    df_practical = pd.DataFrame(practical_course_data)  # New DataFrame
    
    # Convert and sort dates for all DataFrames
    for df_temp in [df, df_fundamentals, df_early_course, df_midgame_course, df_classes, df_practical]:
        date_col = 'Added Date' if 'Added Date' in df_temp.columns else 'Published Date'
        if date_col in df_temp.columns:
            df_temp[date_col] = pd.to_datetime(df_temp[date_col])
            df_temp = df_temp.sort_values(date_col, ascending=False)
            df_temp[date_col] = df_temp[date_col].dt.strftime('%Y-%m-%d %H:%M:%S')
    
    # Save to Excel with multiple sheets
    output_file = user_id + '_content.xlsx'
    
    with pd.ExcelWriter(output_file, engine='xlsxwriter') as writer:
        # Write all sheets
        df.to_excel(writer, index=False, sheet_name='Content')
        df_fundamentals.to_excel(writer, index=False, sheet_name='Jungle Fundamentals')
        df_early_course.to_excel(writer, index=False, sheet_name='Early Game Course')
        df_midgame_course.to_excel(writer, index=False, sheet_name='Midgame Course')
        df_classes.to_excel(writer, index=False, sheet_name='Classes')
        df_practical.to_excel(writer, index=False, sheet_name='Practical Course')  # New sheet
        
        # Auto-adjust columns for all sheets
        for sheet_name in ['Content', 'Jungle Fundamentals', 'Early Game Course', 'Midgame Course', 'Classes', 'Practical Course']:
            worksheet = writer.sheets[sheet_name]
            df_to_adjust = (df if sheet_name == 'Content' 
                          else df_fundamentals if sheet_name == 'Jungle Fundamentals'
                          else df_early_course if sheet_name == 'Early Game Course'
                          else df_midgame_course if sheet_name == 'Midgame Course'
                          else df_classes if sheet_name == 'Classes'
                          else df_practical)
            
            for idx, col in enumerate(df_to_adjust.columns):
                series = df_to_adjust[col]
                max_len = max(
                    series.astype(str).apply(len).max(),
                    len(str(series.name))
                ) + 1
                worksheet.set_column(idx, idx, min(max_len, 100))
    
    print(f"Data successfully exported to {output_file}")
    return df

if __name__ == "__main__":
    # Fetch and save the JSON data
    print("Fetching data...")
    all_data, user_id = fetch_and_save_data()
    
    # Create Excel file
    print("\nCreating Excel file...")
    df = create_excel_from_data(all_data, user_id)
    
    print("\nProcess completed!")