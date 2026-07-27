import { SistemaGestion } from "../models/SistemaGestion.js";
import { Convocatoria } from "../models/Convocatoria.js";
import { Director } from "../models/Director.js";
import { IdGenerator } from "../utils/IdGenerator.js";
import { DEPARTAMENTOS } from "../data/departamentos.data.js";
import { NotaConceptualService } from "./NotaConceptualService.js";
import { ItemPresupuesto } from "../models/ItemPresupuesto.js";
import { Actividad } from "../models/Actividad.js";
import { Cobertura } from "../enums/Cobertura.js";
import { SectorBeneficiario } from "../enums/SectorBeneficiario.js";

/**
 * Precarga datos base para que el sistema no arranque completamente vacío.
 * - Crea una Convocatoria por defecto si no existe ninguna.
 * - Crea Directores de ejemplo.
 * - Crea una Nota Conceptual de muestra para visualización directa en Consultas, Dashboard e Informes.
 */
export class SeedService {
  public static ejecutar(): void {
    const sistema = SistemaGestion.obtenerInstancia();

    if (sistema.convocatorias.length === 0) {
      const hoy = new Date();
      const fechaFin = new Date(hoy);
      fechaFin.setMonth(fechaFin.getMonth() + 6);

      const convocatoriaBase = new Convocatoria(
        IdGenerator.generar("CONV"),
        "Convocatoria de Notas Conceptuales 2026",
        hoy,
        fechaFin
      );
      sistema.registrarConvocatoria(convocatoriaBase);
    }

    if (sistema.directores.length === 0) {
      const directoresBase: [string, string, string, string, string][] = [
        ["María", "Torres Vega", "mtorres@espe.edu.ec", "0991234567", DEPARTAMENTOS[0]],
        ["Carlos", "Ramírez Ponce", "cramirez@espe.edu.ec", "0987654321", DEPARTAMENTOS[1]],
      ];
      directoresBase.forEach(([nombres, apellidos, correo, telefono, departamento]) => {
        sistema.registrarDirector(
          new Director(IdGenerator.generar("DIR"), nombres, apellidos, correo, telefono, departamento)
        );
      });
    }

    if (sistema.notasConceptuales.length === 0) {
      const conv = sistema.convocatorias[0];
      const notaService = new NotaConceptualService();
      
      const hoy = new Date();
      const fechaFinNota = new Date(hoy);
      fechaFinNota.setMonth(fechaFinNota.getMonth() + 3);

      const res = notaService.crear(
        "Implementación de Sistemas de Gestión Ambiental y Huella de Carbono",
        "Sede Sangolquí",
        DEPARTAMENTOS[0],
        "María Torres Vega",
        "mtorres@espe.edu.ec",
        "0991234567",
        hoy,
        fechaFinNota,
        conv
      );

      if (res.valido && res.nota) {
        const nota = res.nota;
        nota.cobertura = [Cobertura.CANTONAL, Cobertura.PROVINCIAL];
        nota.sectorBeneficiario = [SectorBeneficiario.RURAL, SectorBeneficiario.GRUPO_ATENCION_PRIORITARIA];
        nota.localizacion = {
          provincia: "Pichincha",
          canton: "Rumiñahui",
          parroquia: "Sangolquí",
          barrioComunidad: "Campus Matriz ESPE"
        };
        nota.presupuesto.agregarItem(
          new ItemPresupuesto(IdGenerator.generar("ITEM"), "1", "Equipos de Medición Ambiental", "Bien", 2, 4500)
        );
        nota.presupuesto.agregarItem(
          new ItemPresupuesto(IdGenerator.generar("ITEM"), "2", "Capacitaciones comunitarias", "Servicio", 1, 1500)
        );
        nota.cronograma.agregar(
          new Actividad(IdGenerator.generar("ACT"), "Diagnóstico Inicial de Impacto Ambiental", hoy, fechaFinNota)
        );
      }
    }
  }
}
