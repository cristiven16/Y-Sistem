from typing import Optional

def calc_dv_if_nit(tipo_documento_id: Optional[int], numero: str) -> Optional[str]:
    """
    Si tipo_documento_id corresponde a NIT, calculamos DV y lo retornamos.
    De lo contrario, retornamos None.
    Aquí asumes que tipo_documento_id = 2 => 'NIT', por ejemplo.
    Ajusta la lógica a tu conveniencia.
    """
    if not numero:
        return None
    
    # Suponiendo que la tabla 'tipo_documento' con id=2 es 'NIT'
    ID_NIT = 1  
    if tipo_documento_id == ID_NIT:
        return calc_dv_nit_dian(numero)  # Llama a tu función oficial DIAN
    return None


def calc_dv_nit_dian(nit: str) -> str:
    """
    Ejemplo de función de DV según método oficial de la DIAN.
    """
    factors = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 59, 67, 71]
    nit_limpio = "".join(ch for ch in nit if ch.isdigit())
    suma = 0
    for i, digit_char in enumerate(nit_limpio[::-1]):
        if i < len(factors):
            factor = factors[i]
        else:
            # si supera los 14 dígitos, repetimos el último factor
            factor = factors[-1]
        digito = int(digit_char)
        suma += digito * factor
    resto = suma % 11
    if resto in (0, 1):
        dv = resto
    else:
        dv = 11 - resto
    return str(dv)
