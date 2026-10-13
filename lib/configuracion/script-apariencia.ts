import { CLAVE_ULTIMA_PERSONA, NOMBRES_BASE } from "@/lib/demo/claves";

/**
 * Script que corre antes de pintar la página para que el tema y el tamaño de texto elegidos
 * no parpadeen al cargar. Repite en JavaScript simple lo que hace `atributosDeApariencia`.
 * Las preferencias son por persona: usa la última que entró (`lh-ultima-persona`) para armar la clave con prefijo.
 */
export const SCRIPT_APARIENCIA = `(function(){try{var u=localStorage.getItem(${JSON.stringify(CLAVE_ULTIMA_PERSONA)});var k=(u?"u:"+u+":":"")+${JSON.stringify(NOMBRES_BASE.configuracion)};var p=JSON.parse(localStorage.getItem(k)||"{}")||{};var e=document.documentElement;var t=p.tema;if(t!=="claro"&&t!=="oscuro")t=matchMedia("(prefers-color-scheme: dark)").matches?"oscuro":"claro";e.dataset.tema=t;e.dataset.texto=p.texto==="grande"?"grande":"normal";e.dataset.movimiento=p.reducirAnimaciones===true?"reducido":"normal";e.dataset.hifa=p.mostrarHifa===false?"apagada":"visible";}catch(x){}})();`;
