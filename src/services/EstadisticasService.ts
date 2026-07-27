import { SistemaGestion, IEstadisticasDashboard } from "../models/SistemaGestion.js";

export class EstadisticasService {
  private sistema = SistemaGestion.obtenerInstancia();

  public obtener(convocatoriaId: string): IEstadisticasDashboard {
    return this.sistema.obtenerEstadisticas(convocatoriaId);
  }
}
