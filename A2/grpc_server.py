import grpc
from concurrent import futures
from flask import request
import requests
import computeandstorage_pb2
import computeandstorage_pb2_grpc
import boto3


class EC2OperationsServicerImpl(computeandstorage_pb2_grpc.EC2OperationsServicer):
    def __init__(self):
        self.s3_bucket = 'b00945188'
        self.s3_base_url = f'https://b00945188.s3.amazonaws.com'
        self.s3_client = boto3.client('s3')

    def StoreData(self, request, context):
        data = request.data

        file_name = 'data.txt'

        self.s3_client.put_object(
            Bucket=self.s3_bucket,
            Key=file_name,
            Body=data
        )

        s3_uri = f'{self.s3_base_url}/{file_name}'
        print(s3_uri)
        return computeandstorage_pb2.StoreReply(s3uri=s3_uri)

    def AppendData(self, request, context):
        data = request.data
        file_name = 'data.txt'

        existing_data = self.s3_client.get_object(
            Bucket=self.s3_bucket,
            Key=file_name
        )['Body'].read().decode()

        appended_data = existing_data + data

        self.s3_client.put_object(
            Bucket=self.s3_bucket,
            Key=file_name,
            Body=appended_data
        )

        return computeandstorage_pb2.AppendReply()

    def DeleteFile(self, request, context):
        s3_uri = request.s3uri
        s3_key = s3_uri.replace(self.s3_base_url + '/', '')

        self.s3_client.delete_object(
            Bucket=self.s3_bucket,
            Key=s3_key
        )

        return computeandstorage_pb2.DeleteReply()

    def run_client(self):
        channel = grpc.insecure_channel('localhost:50051')
        stub = computeandstorage_pb2_grpc.EC2OperationsStub(channel)
        data = request.get_json().get('data')
        s3_uri = self.perform_store(stub, data)
        self.perform_append(stub, data)
        self.perform_delete(stub, s3_uri)

    def perform_store(self, stub, data):
        store_data_request = computeandstorage_pb2.StoreRequest(
            data=data
        )
        store_data_response = stub.StoreData(store_data_request)
        s3_uri = store_data_response.s3uri if store_data_response.HasField(
            's3uri') else ""
        print("S3 URL:", s3_uri)
        return s3_uri

    def perform_append(self, stub, data):
        append_data_request = computeandstorage_pb2.AppendRequest(
            data=data
        )
        append_data_response = stub.AppendData(append_data_request)
        if append_data_response.success:
            print("AppendData successful")
        else:
            print("AppendData failed")

    def perform_delete(self, stub, s3_uri):
        delete_file_request = computeandstorage_pb2.DeleteRequest(
            s3uri=s3_uri
        )
        delete_file_response = stub.DeleteFile(delete_file_request)
        if delete_file_response.success:
            print("DeleteFile successful")
        else:
            print("DeleteFile failed")


def start_connection():
    payload = {
        "banner": "B00945188",
        "ip": "54.163.122.154:50051"
    }

    res = requests.post("http://54.173.209.76:9000/start", json=payload)
    return res


def start_grpc_server():
    grpc_connection = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    computeandstorage_pb2_grpc.add_EC2OperationsServicer_to_server(
        EC2OperationsServicerImpl(), grpc_connection)
    grpc_connection.add_insecure_port('[::]:50051')
    grpc_connection.start()
    res = start_connection()
    print(res.text)
    grpc_connection.wait_for_termination()


if __name__ == '__main__':
    start_grpc_server()
