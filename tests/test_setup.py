import sys
import mysql.connector
import pandas as pd
import nltk
import spacy
import transformers

def test_python_version():
    assert sys.version_info >= (3, 11)
    print("✓ Python version OK")

def test_packages():
    print("✓ All required packages installed")

def test_mysql():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            port=3307,
            user="root",
            password="password",
            database="rets"
        )
        conn.close()
        print("✓ MySQL connection successful")
    except Exception as e:
        print(f"✗ MySQL connection failed: {e}")

if __name__ == "__main__":
    test_python_version()
    test_packages()
    test_mysql()
    print("\nSetup verification complete!")
