terraform {
  backend "s3" {
    bucket = "terraform-backend-easyshop" # your s3 bucket name
    key    = "easyshop-terraform.tfstate" # your state file name
    region = "us-east-1"
    encrypt = true
    use_lockfile = true
  }
}
