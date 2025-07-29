#!/usr/bin/env python3
"""
S3 Upload Utility for Bitcoin Treasury Analysis
==============================================
Uploads PNG chart files from company directories to S3 buckets

Environment Variables:
- S3_BUCKET_NAME: Target S3 bucket (required)
- AWS_ACCESS_KEY_ID: AWS access key (required)
- AWS_SECRET_ACCESS_KEY: AWS secret key (required)
- AWS_REGION: AWS region (optional, defaults to us-east-1)
- AWS_ENDPOINT_URL: Custom S3 endpoint URL (optional, for S3-compatible services)
- S3_KEY_PREFIX: S3 key prefix (optional, defaults to 'charts')
"""

import glob
import os
from datetime import datetime

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


def upload_company_charts(company_directory, company_name=None):
    """
    Upload all PNG files from a company directory to S3
    
    Args:
        company_directory (str): Path to the company directory containing PNG files
        company_name (str): Optional company name for S3 key prefix. 
                           If None, uses directory name
    
    Returns:
        dict: Upload results with success/failure counts and file details
    """
    # Get S3 configuration from environment variables
    bucket_name = os.getenv('S3_BUCKET_NAME')
    aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_REGION', 'us-east-1')  # Default to us-east-1
    aws_endpoint_url = os.getenv('AWS_ENDPOINT_URL')  # Custom endpoint URL (optional)
    s3_key_prefix = os.getenv('S3_KEY_PREFIX', 'charts')  # Default prefix
    
    # Validate required environment variables
    if not bucket_name:
        raise ValueError("S3_BUCKET_NAME environment variable is required")
    if not aws_access_key_id:
        raise ValueError("AWS_ACCESS_KEY_ID environment variable is required")
    if not aws_secret_access_key:
        raise ValueError("AWS_SECRET_ACCESS_KEY environment variable is required")
    
    # Determine company name from directory if not provided
    if company_name is None:
        company_name = os.path.basename(os.path.abspath(company_directory))
    
    print(f"Uploading charts for {company_name} to S3 bucket: {bucket_name}")
    print(f"Source directory: {company_directory}")
    print(f"S3 key prefix: {s3_key_prefix}/{company_name}")
    
    # Initialize S3 client
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region,
            endpoint_url=aws_endpoint_url
        )
        if aws_endpoint_url:
            print(f"Successfully initialized S3 client for region: {aws_region} using custom endpoint: {aws_endpoint_url}")
        else:
            print(f"Successfully initialized S3 client for region: {aws_region}")
    except NoCredentialsError:
        raise ValueError("Invalid AWS credentials provided")
    
    # Find all PNG files in the company directory
    png_pattern = os.path.join(company_directory, "*.png")
    png_files = glob.glob(png_pattern)
    
    if not png_files:
        print(f"No PNG files found in directory: {company_directory}")
        return {
            'success_count': 0,
            'failure_count': 0,
            'uploaded_files': [],
            'failed_files': []
        }
    
    print(f"Found {len(png_files)} PNG files to upload")
    
    # Upload results tracking
    uploaded_files = []
    failed_files = []

    # Get current timestamp for file organization
    timestamp = datetime.now().strftime('%Y-%m-%d')
    
    # Upload each PNG file
    for png_file in png_files:
        try:
            # Get the filename without path
            filename = os.path.basename(png_file)
            
            # Create S3 key with timestamp and company organization
            s3_key = f"{s3_key_prefix}/{company_name.lower()}/{filename}"
            
            # Upload file to S3
            print(f"Uploading {filename} to s3://{bucket_name}/{s3_key}")
            
            s3_client.upload_file(
                png_file,
                bucket_name,
                s3_key,
                ExtraArgs={
                    'ContentType': 'image/png',
                    'ACL': 'public-read',  # Make file publicly accessible
                    'CacheControl': 'max-age=600',  # Cache for 10 minutes (600 seconds)
                    'Metadata': {
                        'company': company_name,
                        'upload_date': timestamp,
                        'source': 'bitcoin_treasury_analysis'
                    }
                }
            )
            
            # Generate S3 URL
            s3_url = f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/{s3_key}"
            
            uploaded_files.append({
                'local_file': png_file,
                'filename': filename,
                's3_key': s3_key,
                's3_url': s3_url
            })
            
            print(f"✅ Successfully uploaded: {filename}")
            
        except ClientError as e:
            error_msg = f"Failed to upload {filename}: {e}"
            print(f"❌ {error_msg}")
            failed_files.append({
                'local_file': png_file,
                'filename': filename,
                'error': str(e)
            })
        except Exception as e:
            error_msg = f"Unexpected error uploading {filename}: {e}"
            print(f"❌ {error_msg}")
            failed_files.append({
                'local_file': png_file,
                'filename': filename,
                'error': str(e)
            })
    
    # Print summary
    success_count = len(uploaded_files)
    failure_count = len(failed_files)
    
    print(f"\n📊 Upload Summary for {company_name}:")
    print(f"✅ Successfully uploaded: {success_count} files")
    print(f"❌ Failed uploads: {failure_count} files")
    
    if uploaded_files:
        print(f"\n📁 Uploaded files:")
        for file_info in uploaded_files:
            print(f"  • {file_info['filename']} → {file_info['s3_url']}")
    
    if failed_files:
        print(f"\n⚠️  Failed files:")
        for file_info in failed_files:
            print(f"  • {file_info['filename']}: {file_info['error']}")
    
    return {
        'success_count': success_count,
        'failure_count': failure_count,
        'uploaded_files': uploaded_files,
        'failed_files': failed_files,
        'bucket_name': bucket_name,
        'company_name': company_name,
        'timestamp': timestamp
    }


def upload_multiple_companies(base_directory, company_names=None):
    """
    Upload charts for multiple companies
    
    Args:
        base_directory (str): Base directory containing company subdirectories
        company_names (list): List of company names to upload. If None, uploads all subdirectories
    
    Returns:
        dict: Combined upload results for all companies
    """
    if company_names is None:
        # Find all subdirectories that contain PNG files
        company_names = []
        for item in os.listdir(base_directory):
            company_dir = os.path.join(base_directory, item)
            if os.path.isdir(company_dir):
                png_files = glob.glob(os.path.join(company_dir, "*.png"))
                if png_files:
                    company_names.append(item)
    
    print(f"Uploading charts for companies: {company_names}")
    
    all_results = {}
    total_success = 0
    total_failure = 0
    
    for company_name in company_names:
        company_dir = os.path.join(base_directory, company_name)
        if os.path.isdir(company_dir):
            print(f"\n{'='*60}")
            print(f"Processing {company_name}")
            print(f"{'='*60}")
            
            try:
                result = upload_company_charts(company_dir, company_name)
                all_results[company_name] = result
                total_success += result['success_count']
                total_failure += result['failure_count']
            except Exception as e:
                print(f"❌ Failed to process {company_name}: {e}")
                all_results[company_name] = {
                    'success_count': 0,
                    'failure_count': 0,
                    'uploaded_files': [],
                    'failed_files': [],
                    'error': str(e)
                }
        else:
            print(f"⚠️  Directory not found: {company_dir}")
    
    print(f"\n🎯 Overall Summary:")
    print(f"✅ Total successful uploads: {total_success}")
    print(f"❌ Total failed uploads: {total_failure}")
    print(f"🏢 Companies processed: {len(all_results)}")
    
    return {
        'companies': all_results,
        'total_success': total_success,
        'total_failure': total_failure
    }


if __name__ == "__main__":
    # Example usage when run directly
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python s3_uploader.py <company_directory> [company_name]")
        print("Example: python s3_uploader.py ../h100 H100")
        sys.exit(1)
    
    company_dir = sys.argv[1]
    company_name = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        result = upload_company_charts(company_dir, company_name)
        if result['failure_count'] > 0:
            sys.exit(1)  # Exit with error code if any uploads failed
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        sys.exit(1)
