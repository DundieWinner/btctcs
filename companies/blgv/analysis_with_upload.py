from config import run_analysis, upload_charts

if __name__ == "__main__":
    df, output_dir = run_analysis()
    upload_charts(output_dir)
