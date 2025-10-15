"""
Script de prueba para verificar el filtrado con DATOS_ORIGINALES
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.patient_filter_service import PatientFilterService

def test_filter_service():
    """Prueba el servicio de filtrado"""
    print("🧪 PROBANDO SERVICIO DE FILTRADO")
    print("=" * 50)
    
    try:
        service = PatientFilterService()
        
        # Probar obtención de opciones de filtro
        print("\n1. Probando opciones de filtro...")
        options = service.get_filter_options()
        
        print(f"   Comunidades encontradas: {len(options['comunidades'])}")
        print(f"   Primeras 5 comunidades: {options['comunidades'][:5]}")
        print(f"   Sexos: {options['sexos']}")
        print(f"   Diagnósticos encontrados: {len(options['diagnosticos'])}")
        print(f"   Primeros 3 diagnósticos: {options['diagnosticos'][:3]}")
        print(f"   Rango de años: {options['año_nacimiento_range']['min']} - {options['año_nacimiento_range']['max']}")
        
        # Probar filtrado sin filtros (todos los datos)
        print("\n2. Probando filtrado sin filtros...")
        result = service.get_filtered_patients({}, page=1, rows_per_page=5)
        
        print(f"   Total de registros: {result['total_records']}")
        print(f"   Total de páginas: {result['total_pages']}")
        print(f"   Página actual: {result['current_page']}")
        print(f"   Registros en esta página: {len(result['data'])}")
        
        if result['data']:
            print("   Muestra de datos:")
            for i, patient in enumerate(result['data'][:3], 1):
                print(f"     {i}. {patient['nombre']} - {patient['comunidad']} - {patient['año_nacimiento']} - {patient['sexo']} - {patient['diagnostico']}")
        
        # Probar filtrado con filtros específicos
        print("\n3. Probando filtrado con filtros específicos...")
        test_filters = {
            'comunidades': ['ANDALUCÍA'],
            'año_nacimiento_min': 1980,
            'año_nacimiento_max': 1990,
            'sexo': ['Hombre'],
            'diagnosticos': []
        }
        
        result_filtered = service.get_filtered_patients(test_filters, page=1, rows_per_page=5)
        
        print(f"   Filtros aplicados: {test_filters}")
        print(f"   Registros encontrados: {result_filtered['total_records']}")
        print(f"   Páginas totales: {result_filtered['total_pages']}")
        
        if result_filtered['data']:
            print("   Muestra de datos filtrados:")
            for i, patient in enumerate(result_filtered['data'][:3], 1):
                print(f"     {i}. {patient['nombre']} - {patient['comunidad']} - {patient['año_nacimiento']} - {patient['sexo']}")
        
        print("\n✅ Todas las pruebas completadas exitosamente!")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_filter_service()