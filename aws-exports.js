const awsconfig = {
    // Region where your AWS project resources are hosted
    "aws_project_region": "us-east-1",

    // S3 configuration
    "aws_user_files_s3_bucket": "nepse-stock-data",  // Your S3 bucket name
    "aws_user_files_s3_bucket_region": "us-east-1",  // Region of your S3 bucket

    // IAM-based unauthenticated access (ensure correct IAM policies are set)
    "Storage": {
        AWSS3: {
            bucket: "nepse-stock-data",  // Your S3 bucket name
            region: "us-east-1",         // Region of your S3 bucket
        }
    }
};

export default awsconfig;
