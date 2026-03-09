import boto3
import os
import time
from botocore.exceptions import ClientError
from typing import Optional

# DynamoDB Configuration
TABLE_NAME = os.getenv("DYNAMODB_TABLE", "VidyaSetu_Progress")
AWS_REGION = os.getenv("MY_AWS_REGION", os.getenv("AWS_REGION", "us-east-1"))

dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)

def check_rate_limit(user_id: str, limit_type: str = "general") -> bool:
    """
    Implements a Token Bucket / Rate Limit check in DynamoDB.
    Returns True if allowed, False if throttled.
    This ensures cost-efficiency by preventing spam in a stateless Lambda env.
    """
    now = int(time.time())
    key = f"rate_limit#{user_id}#{limit_type}"
    
    # Standard limits:
    # Modules: 1 per 30 seconds
    # Chat: 1 per 5 seconds
    interval = 30 if limit_type == "module" else 5
    
    try:
        response = table.get_item(Key={'PK': key, 'SK': 'metadata'})
        item = response.get('Item')
        
        if item:
            last_call = int(item.get('last_call', 0))
            if now - last_call < interval:
                return False
        
        # Update timestamp
        table.put_item(Item={
            'PK': key,
            'SK': 'metadata',
            'last_call': now,
            'ttl': now + (3600 * 24) # Cleanup after 1 day
        })
        return True
        
    except ClientError as e:
        print(f"DynamoDB Rate Limit Err: {e}")
        return True # Fail open to not block users if DB is down

def save_student_progress(student_id: str, data: dict):
    """
    Saves student progress to DynamoDB.
    """
    try:
        table.put_item(Item={
            'PK': f"student#{student_id}",
            'SK': 'progress',
            'data': data,
            'updated_at': int(time.time())
        })
    except Exception as e:
        print(f"Error saving progress: {e}")

def load_student_progress(student_id: str) -> Optional[dict]:
    """
    Loads student progress from DynamoDB.
    """
    try:
        response = table.get_item(Key={
            'PK': f"student#{student_id}",
            'SK': 'progress'
        })
        return response.get('Item', {}).get('data')
    except Exception as e:
        print(f"Error loading progress: {e}")
        return None

def get_bedrock_cache(cache_key: str) -> Optional[dict]:
    """
    Retrieves a cached AI response from DynamoDB.
    """
    try:
        response = table.get_item(Key={'PK': f"cache#{cache_key}", 'SK': 'response'})
        return response.get('Item', {}).get('response_data')
    except Exception as e:
        print(f"Cache Get Err: {e}")
        return None

def save_bedrock_cache(cache_key: str, response_data: dict):
    """
    Saves an AI response to DynamoDB cache.
    """
    try:
        table.put_item(Item={
            'PK': f"cache#{cache_key}",
            'SK': 'response',
            'response_data': response_data,
            'updated_at': int(time.time()),
            'ttl': int(time.time()) + (3600 * 24 * 7) # Cache for 7 days
        })
    except Exception as e:
        print(f"Cache Save Err: {e}")
