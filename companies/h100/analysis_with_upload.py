from config import run_analysis, upload_charts


if __name__ == "__main__":
    df, current_dir = run_analysis()
    upload_charts(current_dir)
