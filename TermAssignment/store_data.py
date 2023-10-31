import boto3
import json

BUCKET_NAME = 'result-b00945188'

def lambda_handler(event, context):
    # Retrieve the extracted text from the event payload
    extracted_text = event['body']['extracted_text']
    print(extracted_text)

    # Retrieve the object key from the event payload
    object_key = event['body']['object_key']
    print(object_key)

    # Initialize the S3 client
    s3_client = boto3.client('s3')

    # Create a dictionary to store the data
    data = {
        'ImageName': object_key,
        'ExtractedText': extracted_text
    }

    try:
        # Store the data in S3 as JSON
        response = s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=f'{object_key}.json',
            Body=json.dumps(data)
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error storing data in S3: {str(e)}'
        }

    return {
        'statusCode': 200,
        'body': 'Data stored in S3 successfully.'
    }
