#!/usr/bin/env python3
"""
Consolidated Upload Handler for Bitcoin Treasury Analysis
========================================================
Provides a unified upload_charts function that can be imported by all companies
to eliminate code duplication across company config files.
"""

import os
from .s3_uploader import upload_company_charts


def upload_charts(current_dir, company_name=None):
    """
    Consolidated upload function for all companies.
    
    Args:
        current_dir (str): Directory containing the charts to upload
        company_name (str, optional): Company name for S3 organization.
                                    If None, derives from directory name.
    
    Returns:
        dict: Upload results with success/failure counts and details
    """
    try:
        print(f"\n{'='*60}")
        print("UPLOADING CHARTS TO S3")
        print(f"{'='*60}")
        
        # Auto-detect company name from directory if not provided
        if company_name is None:
            company_name = os.path.basename(os.path.abspath(current_dir)).upper()
        
        upload_result = upload_company_charts(current_dir, company_name)
        
        if upload_result['success_count'] > 0:
            print(f"\n🎉 Successfully uploaded {upload_result['success_count']} charts to S3!")
        
        if upload_result['failure_count'] > 0:
            print(f"\n⚠️  {upload_result['failure_count']} uploads failed. Check logs above for details.")
            
        return upload_result
        
    except ValueError as e:
        print(f"\n⚠️  S3 upload skipped: {e}")
        print("To enable S3 upload, set the following environment variables:")
        print("  - S3_BUCKET_NAME")
        print("  - AWS_ACCESS_KEY_ID")
        print("  - AWS_SECRET_ACCESS_KEY")
        return {'success_count': 0, 'failure_count': 0, 'error': str(e)}
        
    except Exception as e:
        print(f"\n❌ Error uploading charts: {e}")
        print("Charts are still available locally in the company directory.")
        return {'success_count': 0, 'failure_count': 0, 'error': str(e)}
