import os
import json
import pymysql
import decimal

def create_conn():

    db_host = os.getenv("MYSQL_HOST", "127.0.0.1") # the IP address or hostname of the database server
    db_user = os.getenv("MYSQL_USER", "root") # the username used to authenticate with the database
    db_pass = os.getenv("MYSQL_PASSWORD", "root") # the password used to authenticate with the database
    db_name = os.getenv("MYSQL_DATABASE", "holistic") # the specific name of the database to access

    # establish and return a new active connection to the MySQL database.
    db_connection = pymysql.connect(host = db_host, user = db_user, password = db_pass, database = db_name, connect_timeout = 2)
    
    return db_connection

def execute_insert(db_connection, sql_query, data_values):
    db_cursor = db_connection.cursor() # a control structure used to traverse and fetch records from the database
    try:
        db_cursor.executemany(sql_query, data_values) # execute the insert query multiple times with the list of data values provided
        db_connection.commit() # save the changes permanently to the database
    except Exception as error_msg:
        print(f"An error occurred: {error_msg}")
        db_connection.rollback() # revert all changes made during this transaction if an error occurs
    finally:
        db_cursor.close() # close the cursor to free up resources
        db_connection.close() # close the connection to the database

def execute_select(db_connection, sql_query, query_params = None):
    db_cursor = db_connection.cursor() # a control structure used to traverse and fetch records from the database
    try:
        if query_params:
            db_cursor.execute(sql_query, query_params) # execute the sql query using the provided safe parameters
        else:
            db_cursor.execute(sql_query) # execute the sql query without any parameters
        
        fetched_rows = db_cursor.fetchall() # retrieve all rows matching the query from the database.
        
        column_headers = [x[0] for x in db_cursor.description] # extract the column names from the query result metadata
        
        results_list = []

        for raw_row in fetched_rows:
            sanitized_row = [] # a list to hold the processed values for the current row
            for cell_value in raw_row:
                if isinstance(cell_value, decimal.Decimal):
                    sanitized_row.append(float(cell_value)) # convert decimal types to standard floats for json compatibility
                elif isinstance(cell_value, str):
                    try:
                        # check if the string looks like a JSON object or array
                        if cell_value.strip().startswith(('{', '[')):
                            sanitized_row.append(json.loads(cell_value)) # parse the string into a JSON object
                        else:
                            sanitized_row.append(cell_value)
                    except json.JSONDecodeError:
                        sanitized_row.append(cell_value)
                else:
                    sanitized_row.append(cell_value)
            
            # combine column headers with the sanitized row values into a dictionary and return it immediately
            row_dict = dict(zip(column_headers, sanitized_row))
            results_list.append(row_dict)
        
        return results_list
        
    finally:
        db_cursor.close() # close the cursor to free up resources
        db_connection.close() # close the connection to the database