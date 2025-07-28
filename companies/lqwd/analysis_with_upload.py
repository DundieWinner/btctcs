#!/usr/bin/env python3
from config import run_analysis, upload_charts


def main():
    df, current_dir = run_analysis()

    upload_charts(current_dir)


if __name__ == "__main__":
    main()
