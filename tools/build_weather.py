"""Turns an EnergyPlus weather file (EPW) into the small hourly file the energy lessons read.

python tools/build_weather.py <file.epw> <out.json> --label "서울" --source-url <page the EPW came from>
"""
import argparse
import csv
import json
from pathlib import Path


def main():
    p = argparse.ArgumentParser()
    p.add_argument('epw')
    p.add_argument('out')
    p.add_argument('--label', required=True)
    p.add_argument('--source-url', required=True)
    a = p.parse_args()
    rows = list(csv.reader(Path(a.epw).read_text(encoding='latin-1').splitlines()))
    loc = rows[0]
    design = rows[1]
    hours = rows[8:]
    assert len(hours) == 8760, len(hours)
    # After 'Heating' come the coldest month and the 99.6 % dry bulb; after 'Cooling', the hottest month, its daily range and the 0.4 % dry bulb.
    heat = design.index('Heating')
    cool = design.index('Cooling')
    col = lambda i, scale=1: [round(float(r[i]) * scale) for r in hours]
    out = {
        'label': a.label,
        'station': loc[1],
        'lat': float(loc[6]), 'lon': float(loc[7]), 'tz': float(loc[8]), 'elevation': float(loc[9]),
        'source': {'name': 'climate.onebuilding.org ' + Path(a.epw).stem, 'url': a.source_url,
                   'note': '여러 해의 관측에서 달마다 대표적인 달을 골라 이은 표준 기상년(TMYx)입니다.'},
        'design': {'heating996': float(design[heat + 2]), 'cooling04': float(design[cool + 3])},
        'units': {'t': '0.1 °C', 'rh': '%', 'ghi': 'W/m²', 'dni': 'W/m²', 'dhi': 'W/m²', 'wind': '0.1 m/s'},
        # Each array starts at 1 January 01:00 and gives the hour that ends at that time.
        't': col(6, 10), 'rh': col(8), 'ghi': col(13), 'dni': col(14), 'dhi': col(15), 'wind': col(21, 10),
    }
    Path(a.out).write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(a.out, Path(a.out).stat().st_size, 'bytes')


if __name__ == '__main__':
    main()
