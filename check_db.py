#!/usr/bin/env python3

import sqlite3
import os

def check_database():
    """Проверка состояния базы данных"""
    db_path = "test.db"
    
    if not os.path.exists(db_path):
        print(f"База данных {db_path} не существует")
        return
    
    print(f"База данных {db_path} существует")
    print(f"Размер: {os.path.getsize(db_path)} байт")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Получаем список таблиц
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"Найдено таблиц: {len(tables)}")
        for table in tables:
            print(f"  - {table[0]}")
            
            # Показываем структуру таблицы
            cursor.execute(f"PRAGMA table_info({table[0]});")
            columns = cursor.fetchall()
            print(f"    Колонки:")
            for col in columns:
                print(f"      {col[1]} ({col[2]})")
            
            # Показываем количество записей
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]};")
            count = cursor.fetchone()[0]
            print(f"    Записей: {count}")
            
            if count > 0:
                # Показываем первые записи
                cursor.execute(f"SELECT * FROM {table[0]} LIMIT 3;")
                rows = cursor.fetchall()
                print(f"    Первые записи:")
                for row in rows:
                    print(f"      {row}")
        
        conn.close()
        
    except Exception as e:
        print(f"Ошибка при проверке базы данных: {e}")

if __name__ == "__main__":
    check_database() 