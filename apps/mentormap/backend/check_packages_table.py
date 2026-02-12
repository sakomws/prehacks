"""Check if packages table exists"""
from app.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print('Tables:', tables)

if 'packages' in tables:
    print('\n✅ Packages table exists!')
    cols = inspector.get_columns('packages')
    print('\nColumns:')
    for col in cols:
        print(f"  - {col['name']}: {col['type']}")
else:
    print('\n❌ Packages table does NOT exist!')
    print('Run: python create_packages_table.py')


