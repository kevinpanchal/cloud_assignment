import boto3

def lambda_handler(event, context):
    # Retrieve the S3 bucket name and key from the event
    bucket_name = event['detail']['bucket']['name']
    object_key = event['detail']['object']['key']

    # Initialize the AWS clients for Textract
    textract_client = boto3.client('textract')

    # Call Textract to extract text from the image
    response = textract_client.start_document_text_detection(
        DocumentLocation={'S3Object': {
            'Bucket': bucket_name, 'Name': object_key}}
    )

    # Retrieve the job ID from the Textract response
    job_id = response['JobId']

    # Check the status of the Textract job and retrieve the results once completed
    while True:
        job_status = textract_client.get_document_text_detection(JobId=job_id)
        status = job_status['JobStatus']

        if status in ['SUCCEEDED', 'FAILED']:
            break

    # Retrieve the extracted text from the Textract response
    extracted_text = ''
    if status == 'SUCCEEDED':
        blocks = job_status['Blocks']
        for block in blocks:
            if block['BlockType'] == 'LINE':
                extracted_text += block['Text'] + ' '

    print(extracted_text)

    # Return the extracted text as the response
    return {
        'statusCode': 200,
        'body': {
            'extracted_text': extracted_text,
            'object_key': object_key
        }
    }
