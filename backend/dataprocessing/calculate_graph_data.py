from dataprocessing.trends import predict_trend


def calculate_graph_data(data: list[dict]) -> list[dict[str, object]]:
    '''
    Calculates varous graphs including time-series line graphs and bar charts.
    '''
    # Pre-processing to remove fabricated breach reports
    data = list(filter(lambda x : not x.get("IsFabricated", True), data))

    years = list(
        map(lambda x: int(x.get("BreachDate", "").split("-")[0]), data))
    year_range = range(min(years), max(years)+1)
    year_breach_counts = {year: years.count(year) for year in year_range}
    year_records_counts = {year: 0 for year in year_range}
    year_passwords_counts = {year: 0 for year in year_range}
    year_data_classes = {year: 0 for year in year_range}
    for i in range(len(data)):
        year_records_counts[years[i]] += data[i].get("PwnCount", 0)
        year_data_classes[years[i]] += len(data[i].get("DataClasses")) # type: ignore
        if "Passwords" in data[i].get("DataClasses", []):
            year_passwords_counts[years[i]] += data[i].get("PwnCount", 0)
    year_avg_records = {
        year: year_records_counts[year]/year_breach_counts[year] for year in year_range
    }
    year_avg_data_classes = {
        year: year_data_classes[year]/year_breach_counts[year] for year in year_range
    }

    yearly_perc_hashed = {year: 0 for year in year_range}
    yearly_perc_salted = {year: 0 for year in year_range}
    year_password_breaches_counts = {year: 0 for year in year_range}


    for i in range(len(data)):
        if "Passwords" in data[i].get("DataClasses", []):
            year_password_breaches_counts[years[i]] += 1
            if data[i].get("isHashed", False):
                yearly_perc_hashed[years[i]] += 1
                if data[i].get("isSalted", False):
                    yearly_perc_salted[years[i]] += 1
    yearly_perc_hashed = {year: (
        v / year_password_breaches_counts[year]) if year_password_breaches_counts[year] != 0 else 0
        for year, v in yearly_perc_hashed.items()}
    yearly_perc_salted = {year: (
        v / year_password_breaches_counts[year]) if year_password_breaches_counts[year] != 0 else 0
        for year, v in yearly_perc_salted.items()}

    yearlyHashFuncCounts = {algo: {year: len([None for i, d in enumerate(data) if d["hashAlgo"] == algo and years[i] == year])
                                   for year in year_range}
                            for algo in sorted(set([x["hashAlgo"]
                                                    for x in data if x["hashAlgo"] is not None]))}

    year_range = list(year_range)

    n_predictions = 5

    stats = [
        {
            "labels": year_range,
            "data": list(year_breach_counts.values()),
            "type": "line",
            "title": "Number of Reported Breached Per Year",
            "trend": predict_trend(tuple(year_breach_counts.values())[:-1], n_predictions, "breach_counts")
        },
        {
            "labels": year_range,
            "data": list(year_password_breaches_counts.values()),
            "type": "line",
            "title": "Number of Reported Password Breaches Per Year",
            "trend": predict_trend(tuple(year_password_breaches_counts.values())[:-1], n_predictions, "password_breaches")
        },
        {
            "labels": year_range,
            "data": list(year_records_counts.values()),
            "type": "line",
            "title": "Number of Records Impacted Per Year",
            "trend": predict_trend(tuple(year_records_counts.values())[:-1], n_predictions, "record_counts")
        },
        {
            "labels": year_range,
            "data": list(year_passwords_counts.values()),
            "type": "line",
            "title": "Number of Passwords Leaked Per Year",
            "trend": predict_trend(tuple(year_passwords_counts.values())[:-1], n_predictions, "password_counts")
        },
        {
            "labels": year_range,
            "data": list(year_avg_records.values()),
            "type": "line",
            "title": "Average Number of Records Per Breach Per Year",
            "trend": predict_trend(tuple(year_avg_records.values())[:-1], n_predictions, "avg_records")
        },
        {
            "labels": year_range,
            "data": list(year_avg_data_classes.values()),
            "type": "line",
            "title": "Average Number of Data Classes Per Breach Per Year",
            "trend": predict_trend(tuple(year_avg_data_classes.values())[:-1], n_predictions, "avg_data_classes")
        },
        {
            "labels": year_range,
            "data": list(yearly_perc_hashed.values()),
            "type": "line",
            "title": "Percentage of Password Breaches That Are Hashed Per Year",
            "trend": predict_trend(tuple(yearly_perc_hashed.values())[:-1], n_predictions, "percent_hashed")
        },
        {
            "labels": year_range,
            "data": list(yearly_perc_salted.values()),
            "type": "line",
            "title": "Percentage of Password Breaches That Are Hashed AND Salted Per Year",
            "trend": predict_trend(tuple(yearly_perc_salted.values())[:-1], n_predictions, "percent_salted")
        },
        {
            "labels": list(yearlyHashFuncCounts.keys()),
            "data": [sum(x.values()) for x in yearlyHashFuncCounts.values()],
            "type": "bar",
            "title": "Hash Function Counts"
        },
        {
            "labels": year_range,
            "lines": list(map(lambda x: {
                "label": x[0],
                "data": list(x[1].values()),
                "trend": predict_trend(tuple(x[1].values())[:-1], n_predictions)
            }, yearlyHashFuncCounts.items())),
            "type": "multiLine",
            "title": "Hash Function Occurances Over Time",
        }
    ]

    return stats