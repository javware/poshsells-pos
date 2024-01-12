import json
import ast
employee_string = "{'success': False, 'error': None, 'error_message': 'Error en la generación de factura/boleta desde Nubefact', 'response_nubefact': {'errors': 'Este documento ya existe en NubeFacT', 'codigo': 23}}"
employee_string1 = ""
employee_dict = json.dumps(ast.literal_eval(employee_string))
employee_dict = json.loads(employee_dict)

if employee_string != "":
    if not employee_dict['success']:
        print("true")




