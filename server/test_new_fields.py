"""
Script de prueba para verificar los nuevos campos añadidos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.patient_filter_service import PatientFilterService

def test_new_fields():
    """Prueba los nuevos campos añadidos"""
    print("🧪 PROBANDO NUEVOS CAMPOS AÑADIDOS")
    print("=" * 50)
    
    try:
        service = PatientFilterService()
        
        # Probar obtención de opciones de filtro con centros
        print("\n1. Probando opciones de filtro con centros...")
        options = service.get_filter_options()
        
        print(f"   Centros encontrados: {len(options['centros'])}")
        print(f"   Primeros 5 centros: {options['centros'][:5]}")
        
        # Probar filtrado sin filtros para ver los nuevos campos
        print("\n2. Probando datos con nuevos campos...")
        result = service.get_filtered_patients({}, page=1, rows_per_page=3)
        
        print(f"   Total de registros: {result['total_records']}")
        
        if result['data']:
            print("   Muestra de datos con nuevos campos:")
            for i, patient in enumerate(result['data'], 1):
                print(f"     {i}. {patient['nombre']}")
                print(f"        - Comunidad: {patient['comunidad']}")
                print(f"        - Centro: {patient['centro']}")
                print(f"        - Fecha Ingreso: {patient['fecha_ingreso']}")
                print(f"        - Fecha Fin: {patient['fecha_fin_contacto']}")
                print(f"        - Estancia: {patient['estancia_dias']} días")
                print(f"        - Año Nacimiento: {patient['año_nacimiento']}")
                print(f"        - Sexo: {patient['sexo']}")
                print(f"        - Diagnóstico: {patient['diagnostico'][:50]}...")
                print()
        
        # Probar filtrado por centro
        print("\n3. Probando filtrado por centro...")
        if options['centros']:
            test_centro = options['centros'][0]  # Primer centro disponible
            test_filters = {
                'centros': [test_centro]
            }
            
            result_filtered = service.get_filtered_patients(test_filters, page=1, rows_per_page=3)
            
            print(f"   Filtro aplicado: centro = '{test_centro}'")
            print(f"   Registros encontrados: {result_filtered['total_records']}")
            
            if result_filtered['data']:
                print("   Muestra de datos filtrados por centro:")
                for i, patient in enumerate(result_filtered['data'], 1):
                    print(f"     {i}. {patient['nombre']} - Centro: {patient['centro']}")
        
        print("\n✅ Todas las pruebas de nuevos campos completadas exitosamente!")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_new_fields()