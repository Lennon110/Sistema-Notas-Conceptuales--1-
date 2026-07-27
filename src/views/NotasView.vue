<template>
  <div class="notas-view">
    <!-- VISTA 1: LISTADO DE NOTAS CONCEPTUALES -->
    <div v-if="!mostrandoWizard" class="listado-notasanimate-fade-in">
      <div class="header-actions">
        <h2>Notas Conceptuales</h2>
        <button class="btn btn-primario" @click="iniciarCreacion">
          ➕ Nueva Nota Conceptual
        </button>
      </div>

      <div class="card table-card margin-top-md">
        <div v-if="notas.length === 0" class="tabla-vacia">
          No hay notas conceptuales registradas en el sistema.
        </div>
        <div v-else class="table-responsive">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Proyecto</th>
                <th>Convocatoria</th>
                <th>Docente Responsable</th>
                <th>Estado</th>
                <th>Presupuesto Total</th>
                <th class="acciones-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in notas" :key="n.id">
                <td class="font-bold code-column">{{ n.codigo }}</td>
                <td>{{ n.nombre }}</td>
                <td>{{ obtenerNombreConvocatoria(n.convocatoriaId) }}</td>
                <td>{{ n.director ? n.director.obtenerNombreCompleto() : 'Sin asignar' }}</td>
                <td>
                  <span class="badge" :class="'badge-' + n.estado.toLowerCase().replace(/\s+/g, '_')">
                    {{ n.estado }}
                  </span>
                </td>
                <td class="font-bold price-tag">${{ n.calcularPresupuestoTotal().toLocaleString('es-EC', { minimumFractionDigits: 2 }) }}</td>
                <td class="acciones-celda">
                  <button 
                    class="btn-icon btn-edit" 
                    title="Editar"
                    @click="iniciarEdicion(n)"
                  >
                    ✏️
                  </button>
                  <button 
                    class="btn-icon btn-delete" 
                    title="Eliminar"
                    @click="eliminarNota(n.id)"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- VISTA 2: WIZARD / CARRUSEL DE 6 PASOS -->
    <div v-else class="wizard-container animate-fade-in">
      <div class="wizard-header card">
        <div class="wizard-title-group">
          <h2>{{ editandoNotaId ? 'Modificar Nota Conceptual' : 'Nueva Nota Conceptual' }}</h2>
          <span class="wizard-subtitle">Siga los pasos obligatorios para completar el formulario</span>
        </div>
        <!-- Indicador de pasos -->
        <div class="wizard-steps-indicator">
          <div 
            v-for="(stepName, index) in pasos" 
            :key="index"
            class="step-indicator-item"
            :class="{ 
              active: currentStep === index, 
              completed: currentStep > index,
              disabled: index > currentStep && !editandoNotaId 
            }"
            @click="irAPasoDirecto(index)"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <span class="step-label">{{ stepName }}</span>
          </div>
        </div>
      </div>

      <!-- Contenedor del paso activo -->
      <div class="wizard-step-content card margin-top-md">
        
        <!-- PASO 0: SELECCIONAR CONVOCATORIA (MANDATORIO) -->
        <div v-if="currentStep === 0" class="step-pane">
          <h3 class="seccion-titulo">Selección Obligatoria de Convocatoria</h3>
          <div class="campo-formulario max-width-md">
            <label for="wiz-convocatoria">Convocatoria Asociada <span class="obligatorio">*</span></label>
            <select 
              id="wiz-convocatoria" 
              v-model="wizardData.convocatoriaId" 
              class="custom-select"
              :disabled="!!editandoNotaId"
            >
              <option value="" disabled>-- Seleccione una convocatoria --</option>
              <option 
                v-for="c in convocatoriasAbiertas" 
                :key="c.id" 
                :value="c.id"
              >
                {{ c.nombre }} ({{ formatearFecha(c.fechaInicio) }} - {{ formatearFecha(c.fechaFin) }})
              </option>
            </select>
            <span class="help-text">Toda nota conceptual debe estar vinculada obligatoriamente a una convocatoria abierta y vigente.</span>
          </div>
        </div>

        <!-- PASO 1: DATOS GENERALES -->
        <div v-else-if="currentStep === 1" class="step-pane">
          <h3 class="seccion-titulo">1. Datos Generales</h3>
          
          <div class="campo-formulario">
            <label for="wiz-nombre">Nombre del proyecto <span class="obligatorio">*</span></label>
            <input 
              type="text" 
              id="wiz-nombre" 
              v-model="wizardData.nombre" 
              placeholder="¿Qué se va a hacer? ¿Sobre qué?" 
              class="input-full"
            />
          </div>

          <div class="fila-campos">
            <div class="campo-formulario">
              <label for="wiz-sede">Sede / Unidad Académica <span class="obligatorio">*</span></label>
              <select id="wiz-sede" v-model="wizardData.sedeUnidadAcademica" class="custom-select">
                <option value="">Seleccione un elemento</option>
                <option v-for="s in SEDES_UNIDADES" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="wiz-depto-principal">Departamento <span class="obligatorio">*</span></label>
              <select id="wiz-depto-principal" v-model="wizardData.departamento" class="custom-select">
                <option value="">Seleccione un elemento</option>
                <option v-for="d in DEPARTAMENTOS_CAT" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>

          <div class="fila-campos">
            <div class="campo-formulario">
              <label for="wiz-fecha-inicio">Fecha de inicio planificada <span class="obligatorio">*</span></label>
              <input type="date" id="wiz-fecha-inicio" v-model="wizardData.fechaInicioPlanificada" />
            </div>
            
            <div class="campo-formulario">
              <label for="wiz-fecha-fin">Fecha de finalización planificada <span class="obligatorio">*</span></label>
              <input type="date" id="wiz-fecha-fin" v-model="wizardData.fechaFinPlanificada" />
            </div>
          </div>

          <!-- SECCIÓN: DATOS DEL DIRECTOR DEL PROYECTO -->
          <div class="sub-form-section margin-top-lg">
            <h4>Datos del Director del Proyecto</h4>
            <div class="campo-formulario">
              <label for="wiz-dir-nombre">Nombre del docente responsable <span class="obligatorio">*</span></label>
              <input 
                type="text" 
                id="wiz-dir-nombre" 
                v-model="wizardData.directorNombre" 
                placeholder="Nombre completo" 
              />
            </div>
            <div class="fila-campos">
              <div class="campo-formulario">
                <label for="wiz-dir-correo">Correo electrónico <span class="obligatorio">*</span></label>
                <input 
                  type="email" 
                  id="wiz-dir-correo" 
                  v-model="wizardData.directorCorreo" 
                  placeholder="ejemplo@espe.edu.ec" 
                />
              </div>
              <div class="campo-formulario">
                <label for="wiz-dir-celular">Teléfono celular <span class="obligatorio">*</span></label>
                <input 
                  type="text" 
                  id="wiz-dir-celular" 
                  v-model="wizardData.directorTelefono" 
                  placeholder="Ej. 0991234567" 
                />
              </div>
            </div>
          </div>

          <div class="fila-campos margin-top-lg">
            <div class="campo-formulario">
              <label>Cobertura</label>
              <div class="grupo-checkbox">
                <label v-for="c in COBERTURAS" :key="c.val" class="checkbox-item">
                  <input type="checkbox" :value="c.val" v-model="wizardData.cobertura" />
                  {{ c.label }}
                </label>
              </div>
            </div>
            <div class="campo-formulario">
              <label>Sector de la población beneficiaria</label>
              <div class="grupo-checkbox">
                <label v-for="s in SECTORES_BENEF" :key="s.val" class="checkbox-item">
                  <input type="checkbox" :value="s.val" v-model="wizardData.sectorBeneficiario" />
                  {{ s.label }}
                </label>
              </div>
            </div>
          </div>

          <div class="sub-form-section margin-top-lg">
            <h4>Localización</h4>
            <div class="grid-4-cols">
              <div class="campo-formulario">
                <label for="loc-provincia">Provincia</label>
                <input type="text" id="loc-provincia" v-model="wizardData.localizacion.provincia" />
              </div>
              <div class="campo-formulario">
                <label for="loc-canton">Cantón</label>
                <input type="text" id="loc-canton" v-model="wizardData.localizacion.canton" />
              </div>
              <div class="campo-formulario">
                <label for="loc-parroquia">Parroquia</label>
                <input type="text" id="loc-parroquia" v-model="wizardData.localizacion.parroquia" />
              </div>
              <div class="campo-formulario">
                <label for="loc-barrio">Barrio o comunidad</label>
                <input type="text" id="loc-barrio" v-model="wizardData.localizacion.barrioComunidad" />
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 2: ALINEAMIENTO -->
        <div v-else-if="currentStep === 2" class="step-pane">
          <h3 class="seccion-titulo">2. Alineamiento</h3>
          
          <!-- 2.1 Ámbitos prioritarios -->
          <div class="campo-formulario">
            <label>2.1 Ámbitos prioritarios de actuación <span class="obligatorio">*</span></label>
            <div class="table-responsive">
              <table class="tabla sub-tabla">
                <thead>
                  <tr>
                    <th>Ámbitos prioritarios de actuación</th>
                    <th>Definición</th>
                    <th style="width: 150px">Condición</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ambito, idx) in wizardData.alineamiento.ambitos" :key="idx">
                    <td class="font-bold">{{ ambito.nombre }}</td>
                    <td class="text-muted text-xs">{{ obtenerDefinicionAmbito(ambito.nombre) }}</td>
                    <td>
                      <label class="radio-inline">
                        <input type="radio" :name="'ambito-' + idx" :value="true" v-model="ambito.aplica" /> SI
                      </label>
                      <label class="radio-inline">
                        <input type="radio" :name="'ambito-' + idx" :value="false" v-model="ambito.aplica" /> NO
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2.2 ODS -->
          <div class="sub-form-section margin-top-lg">
            <h4>2.2 ¿A qué objetivos de desarrollo sostenible ODS 2030 se alinea? (Máx. 2)</h4>
            
            <div class="formulario-inline-vue margin-bottom-md">
              <div class="campo-select">
                <label>Objetivo ODS</label>
                <select v-model="tmpOds.odsId" class="custom-select" @change="onOdsChange">
                  <option value="">Seleccione ODS</option>
                  <option v-for="o in ODS_LIST" :key="o.codigo" :value="o.codigo">{{ o.texto }}</option>
                </select>
              </div>
              <div class="campo-select">
                <label>Meta</label>
                <select v-model="tmpOds.metaId" class="custom-select" :disabled="!tmpOds.odsId">
                  <option value="">Seleccione Meta</option>
                  <option v-for="m in metasFiltradas" :key="m.codigo" :value="m.codigo">{{ m.texto }}</option>
                </select>
              </div>
              <button type="button" class="btn btn-secundario btn-add-inline" @click="agregarOds">
                + Agregar ODS
              </button>
            </div>

            <table class="tabla sub-tabla">
              <thead>
                <tr>
                  <th>Código ODS</th>
                  <th>Meta Seleccionada</th>
                  <th style="width: 100px">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="wizardData.alineamiento.ods.length === 0">
                  <td colspan="3" class="text-center text-muted">No se han registrado alineamientos ODS.</td>
                </tr>
                <tr v-for="o in wizardData.alineamiento.ods" :key="o.codigo">
                  <td class="font-bold">ODS {{ o.codigo }}</td>
                  <td>{{ o.metaSeleccionada }}</td>
                  <td>
                    <button type="button" class="btn-icon btn-delete" @click="eliminarOds(o.codigo)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 2.3 CINE-UNESCO -->
          <div class="sub-form-section margin-top-lg">
            <h4>2.3 ¿A qué campos de educación y capacitación (CINE-UNESCO) articula?</h4>
            <div class="grid-3-cols">
              <div class="campo-formulario">
                <label>Campo Amplio</label>
                <select v-model="wizardData.alineamiento.cineAmplio" class="custom-select" @change="onCineAmplioChange">
                  <option value="">Seleccione elemento</option>
                  <option v-for="c in CINE_AMPLIO_CAT" :key="c.codigo" :value="c.codigo">{{ c.texto }}</option>
                </select>
              </div>
              <div class="campo-formulario">
                <label>Campo Específico</label>
                <select v-model="wizardData.alineamiento.cineEspecifico" class="custom-select" :disabled="!wizardData.alineamiento.cineAmplio" @change="onCineEspecificoChange">
                  <option value="">Seleccione elemento</option>
                  <option v-for="c in cineEspecificoFiltrado" :key="c.codigo" :value="c.codigo">{{ c.texto }}</option>
                </select>
              </div>
              <div class="campo-formulario">
                <label>Campo Detallado</label>
                <select v-model="wizardData.alineamiento.cineDetallado" class="custom-select" :disabled="!wizardData.alineamiento.cineEspecifico">
                  <option value="">Seleccione elemento</option>
                  <option v-for="c in cineDetalladoFiltrado" :key="c.codigo" :value="c.codigo">{{ c.texto }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2.4 Plan Nacional de Desarrollo -->
          <div class="sub-form-section margin-top-lg">
            <h4>2.4 ¿A qué objetivo del Plan Nacional de Desarrollo se alinea el proyecto?</h4>
            <div class="fila-campos">
              <div class="campo-formulario">
                <label>Objetivo PND</label>
                <select v-model="wizardData.alineamiento.pndObjetivo" class="custom-select" @change="onPndChange">
                  <option value="">Seleccione elemento</option>
                  <option v-for="p in PND_OBJETIVOS_CAT" :key="p.codigo" :value="p.codigo">{{ p.texto }}</option>
                </select>
              </div>
              <div class="campo-formulario">
                <label>Política PND</label>
                <select v-model="wizardData.alineamiento.pndPolitica" class="custom-select" :disabled="!wizardData.alineamiento.pndObjetivo">
                  <option value="">Seleccione elemento</option>
                  <option v-for="pol in pndPoliticasFiltradas" :key="pol.codigo" :value="pol.codigo">{{ pol.texto }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2.5 GAD -->
          <div class="sub-form-section margin-top-lg">
            <h4>2.5 ¿A qué objetivos provinciales, cantonales y parroquiales se alinea el proyecto?</h4>
            <div class="campo-formulario">
              <label for="gad-prov">Objetivo GAD Provincial</label>
              <textarea id="gad-prov" v-model="wizardData.alineamiento.gadProvincial" rows="2"></textarea>
            </div>
            <div class="campo-formulario">
              <label for="gad-cant">Objetivo GAD Cantonal</label>
              <textarea id="gad-cant" v-model="wizardData.alineamiento.gadCantonal" rows="2"></textarea>
            </div>
            <div class="campo-formulario">
              <label for="gad-parr">Objetivo GAD Parroquial</label>
              <textarea id="gad-parr" v-model="wizardData.alineamiento.gadParroquial" rows="2"></textarea>
            </div>
            <div class="campo-formulario">
              <label for="gad-ausp">Objetivo de la entidad auspiciante o comunidad beneficiaria</label>
              <textarea id="gad-ausp" v-model="wizardData.alineamiento.gadEntidadAuspiciante" rows="2"></textarea>
            </div>
          </div>

          <!-- 2.6 PEI Plan Estratégico -->
          <div class="sub-form-section margin-top-lg">
            <h4>2.6 ¿A qué objetivos del Plan Estratégico Institucional se alinea?</h4>
            <div class="fila-campos">
              <div class="campo-formulario">
                <label>Objetivo PEI</label>
                <select v-model="wizardData.alineamiento.peiObjetivo" class="custom-select">
                  <option value="">Seleccione objetivo</option>
                  <option v-for="o in OE_OBJETIVOS_CAT" :key="o.codigo" :value="o.codigo">{{ o.texto }}</option>
                </select>
              </div>
              <div class="campo-formulario">
                <label>Estrategia PEI</label>
                <select v-model="wizardData.alineamiento.peiEstrategia" class="custom-select">
                  <option value="">Seleccione estrategia</option>
                  <option v-for="e in OE_ESTRATEGIAS_CAT" :key="e.codigo" :value="e.codigo">{{ e.texto }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2.7 y 2.8 Dominios y Líneas de Investigación -->
          <div class="sub-form-section margin-top-lg">
            <div class="fila-campos">
              <div class="campo-formulario">
                <h4>2.7 Líneas de Investigación (Máx. 2)</h4>
                <div class="formulario-inline-vue">
                  <select v-model="tmpLinea" class="custom-select">
                    <option value="">Seleccione línea</option>
                    <option v-for="l in LINEAS_INVEST_CAT" :key="l" :value="l">{{ l }}</option>
                  </select>
                  <button type="button" class="btn btn-secundario btn-add-inline" @click="agregarLinea">
                    + Agregar
                  </button>
                </div>
                <ul class="added-list">
                  <li v-for="l in wizardData.alineamiento.lineasInvestigacion" :key="l">
                    {{ l }} <button type="button" class="btn-text-delete" @click="eliminarLinea(l)">✕</button>
                  </li>
                  <li v-if="wizardData.alineamiento.lineasInvestigacion.length === 0" class="text-muted text-xs">Ninguna línea agregada.</li>
                </ul>
              </div>

              <div class="campo-formulario">
                <h4>2.8 Dominio Académico</h4>
                <div class="campo-formulario">
                  <label>Dominio Institucional</label>
                  <select v-model="wizardData.alineamiento.dominioInstitucional" class="custom-select">
                    <option value="">Seleccione dominio</option>
                    <option v-for="d in DOMINIOS_INST_CAT" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div class="campo-formulario margin-top-sm">
                  <label>Dominios Académicos</label>
                  <select v-model="wizardData.alineamiento.dominioAcademico" class="custom-select">
                    <option value="">Seleccione dominio</option>
                    <option v-for="d in DOMINIOS_ACAD_CAT" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 3: DEPARTAMENTOS Y CARRERAS PARTICIPANTES -->
        <div v-else-if="currentStep === 3" class="step-pane">
          <h3 class="seccion-titulo">3. Departamentos y Carreras Participantes</h3>
          
          <!-- 3.1 Departamentos participantes -->
          <div class="sub-form-section">
            <h4>3.1 Departamentos participantes</h4>
            <div class="formulario-inline-vue inline-grid-depto">
              <select v-model="tmpDepto.sede" class="custom-select">
                <option value="">Sede/Unidad</option>
                <option v-for="s in SEDES_UNIDADES" :key="s" :value="s">{{ s }}</option>
              </select>
              <select v-model="tmpDepto.nombre" class="custom-select">
                <option value="">Departamento</option>
                <option v-for="d in DEPARTAMENTOS_CAT" :key="d" :value="d">{{ d }}</option>
              </select>
              <input type="text" v-model="tmpDepto.objetivo" placeholder="Objetivo de la nota" />
              <input type="number" v-model="tmpDepto.docentes" placeholder="Nro. docentes" min="1" style="width:110px" />
              <button type="button" class="btn btn-secundario btn-add-inline" @click="agregarDeptoParticipante">+ Agregar</button>
            </div>

            <table class="tabla sub-tabla margin-top-sm">
              <thead>
                <tr>
                  <th>Sede/Unidad</th>
                  <th>Departamento</th>
                  <th>Objetivo</th>
                  <th>Nro. docentes</th>
                  <th style="width: 80px">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="wizardData.departamentosParticipantes.length === 0">
                  <td colspan="5" class="text-center text-muted">No se han registrado departamentos participantes.</td>
                </tr>
                <tr v-for="(d, idx) in wizardData.departamentosParticipantes" :key="idx">
                  <td>{{ d.sede }}</td>
                  <td class="font-bold">{{ d.nombre }}</td>
                  <td>{{ d.objetivo }}</td>
                  <td>{{ d.docentes }}</td>
                  <td>
                    <button type="button" class="btn-icon btn-delete" @click="eliminarDeptoParticipante(idx)">🗑️</button>
                  </td>
                </tr>
                <tr v-if="wizardData.departamentosParticipantes.length > 0" class="totales-row">
                  <td colspan="3" class="font-bold">TOTALES</td>
                  <td class="font-bold">{{ totalDocentesParticipantes }}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 3.2 Carreras participantes -->
          <div class="sub-form-section margin-top-xl">
            <h4>3.2 Carreras participantes</h4>
            <div class="formulario-inline-vue inline-grid-depto">
              <select v-model="tmpCarrera.sede" class="custom-select">
                <option value="">Sede/Unidad</option>
                <option v-for="s in SEDES_UNIDADES" :key="s" :value="s">{{ s }}</option>
              </select>
              <input type="text" v-model="tmpCarrera.nombre" placeholder="Carrera" />
              <input type="text" v-model="tmpCarrera.objetivo" placeholder="Objetivo de la nota" />
              <input type="number" v-model="tmpCarrera.estudiantes" placeholder="Nro. estudiantes" min="1" style="width:110px" />
              <button type="button" class="btn btn-secundario btn-add-inline" @click="agregarCarreraParticipante">+ Agregar</button>
            </div>

            <table class="tabla sub-tabla margin-top-sm">
              <thead>
                <tr>
                  <th>Sede/Unidad</th>
                  <th>Carrera</th>
                  <th>Objetivo</th>
                  <th>Nro. estudiantes</th>
                  <th style="width: 80px">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="wizardData.carrerasParticipantes.length === 0">
                  <td colspan="5" class="text-center text-muted">No se han registrado carreras participantes.</td>
                </tr>
                <tr v-for="(c, idx) in wizardData.carrerasParticipantes" :key="idx">
                  <td>{{ c.sede }}</td>
                  <td class="font-bold">{{ c.nombre }}</td>
                  <td>{{ c.objetivo }}</td>
                  <td>{{ c.estudiantes }}</td>
                  <td>
                    <button type="button" class="btn-icon btn-delete" @click="eliminarCarreraParticipante(idx)">🗑️</button>
                  </td>
                </tr>
                <tr v-if="wizardData.carrerasParticipantes.length > 0" class="totales-row">
                  <td colspan="3" class="font-bold">TOTALES</td>
                  <td class="font-bold">{{ totalEstudiantesParticipantes }}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PASO 4: IMPACTOS ESPERADOS -->
        <div v-else-if="currentStep === 4" class="step-pane">
          <h3 class="seccion-titulo">4. Impactos Esperados</h3>
          
          <table class="tabla table-impacts">
            <thead>
              <tr>
                <th style="width: 200px">Tipo de impacto</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="imp in wizardData.impactos" :key="imp.tipo">
                <td class="font-bold">{{ imp.tipoNombre }}</td>
                <td>
                  <textarea v-model="imp.descripcion" rows="3" class="textarea-full" placeholder="Ingrese la descripción del impacto..."></textarea>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="sub-form-section margin-top-lg">
            <h4>4.1 Identificación y caracterización de la población objetivo</h4>
            <div class="grid-3-cols">
              <div class="campo-formulario">
                <label for="pop-ref">Población de Referencia <span class="obligatorio">*</span></label>
                <input type="number" id="pop-ref" v-model.number="wizardData.poblacion.referencia" min="0" @blur="validarJerarquiaPoblacion" />
              </div>
              <div class="campo-formulario">
                <label for="pop-pot">Población Potencial <span class="obligatorio">*</span></label>
                <input type="number" id="pop-pot" v-model.number="wizardData.poblacion.potencial" min="0" @blur="validarJerarquiaPoblacion" />
              </div>
              <div class="campo-formulario">
                <label for="pop-obj">Población Objetivo (Beneficiario directo) <span class="obligatorio">*</span></label>
                <input type="number" id="pop-obj" v-model.number="wizardData.poblacion.objetivo" min="0" @blur="validarJerarquiaPoblacion" />
              </div>
            </div>
            <span v-if="errorPoblacion" class="mensaje-error animate-fade-in">{{ errorPoblacion }}</span>
          </div>
        </div>

        <!-- PASO 5: FINANCIAMIENTO Y PRESUPUESTO -->
        <div v-else-if="currentStep === 5" class="step-pane">
          <h3 class="seccion-titulo">5. Financiamiento y Presupuesto</h3>
          
          <div class="budget-limit-status" :class="{ 'exceeded': totalPresupuesto > 20000 }">
            <span class="font-bold">TOTAL PRESUPUESTO PROYECTO: ${{ totalPresupuesto.toLocaleString('es-EC', { minimumFractionDigits: 2 }) }}</span>
            <span>Límite Máximo Permitido: $20,000.00</span>
          </div>

          <div class="sub-form-section margin-top-md">
            <h4>5.1 Presupuesto Detallado</h4>
            <div class="formulario-inline-vue inline-grid-budget margin-bottom-md">
              <input type="text" v-model="tmpItem.nro" placeholder="Nro. ítem" style="width: 90px" />
              <input type="text" v-model="tmpItem.descripcion" placeholder="Descripción" />
              <input type="text" v-model="tmpItem.bienServicio" placeholder="Bien o servicio" />
              <input type="number" v-model.number="tmpItem.cantidad" placeholder="Cant." min="1" style="width: 80px" />
              <input type="number" v-model.number="tmpItem.valorUnitario" placeholder="V.U." min="0" step="0.01" style="width: 100px" />
              <button type="button" class="btn btn-secundario btn-add-inline" @click="agregarItemPresupuesto">+ Agregar</button>
            </div>

            <table class="tabla sub-tabla">
              <thead>
                <tr>
                  <th style="width: 90px">Nro. ítem</th>
                  <th>Descripción</th>
                  <th>Bien o servicio</th>
                  <th style="width: 80px">Cantidad</th>
                  <th style="width: 110px">V. Unitario</th>
                  <th style="width: 110px">Total</th>
                  <th style="width: 80px">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="wizardData.presupuestoItems.length === 0">
                  <td colspan="7" class="text-center text-muted">No se han registrado ítems de presupuesto.</td>
                </tr>
                <tr v-for="(item, idx) in wizardData.presupuestoItems" :key="idx">
                  <td>{{ item.nro }}</td>
                  <td class="font-bold">{{ item.descripcion }}</td>
                  <td>{{ item.bienServicio }}</td>
                  <td>{{ item.cantidad }}</td>
                  <td>${{ item.valorUnitario.toFixed(2) }}</td>
                  <td class="font-bold">${{ (item.cantidad * item.valorUnitario).toFixed(2) }}</td>
                  <td>
                    <button type="button" class="btn-icon btn-delete" @click="eliminarItemPresupuesto(idx)">🗑️</button>
                  </td>
                </tr>
                <tr v-if="wizardData.presupuestoItems.length > 0" class="totales-row">
                  <td colspan="5" class="font-bold">TOTAL $</td>
                  <td class="font-bold">${{ totalPresupuesto.toFixed(2) }}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 5.2 Presupuesto de Entidad Auspiciante -->
          <div class="sub-form-section margin-top-xl">
            <h4>5.2 Aporte de Entidad Auspiciante / Cooperante</h4>
            <div class="campo-formulario max-width-md">
              <label for="wiz-coop-name">Nombre de la Entidad Cooperante</label>
              <input type="text" id="wiz-coop-name" v-model="wizardData.cooperanteNombre" placeholder="Ej. Municipio de Quito / Empresa Privada" />
            </div>

            <div class="cooperante-items margin-top-md animate-fade-in">
              <div class="formulario-inline-vue inline-grid-budget-coop margin-bottom-md">
                <input type="text" v-model="tmpCoop.detalle" placeholder="Detalle del bien o servicio del aporte" />
                <input type="number" v-model.number="tmpCoop.cantidad" placeholder="Cantidad" min="1" style="width: 100px" />
                <input type="number" v-model.number="tmpCoop.valorUnitario" placeholder="V.U $" min="0" step="0.01" style="width: 120px" />
                <button type="button" class="btn btn-secundario btn-add-inline" @click="agregarCoopItem">+ Agregar Aporte</button>
              </div>

              <table class="tabla sub-tabla">
                <thead>
                  <tr>
                    <th>Detalle del bien o servicio del aporte de la entidad auspiciante/cooperante</th>
                    <th style="width: 100px">Cantidad</th>
                    <th style="width: 120px">V.U $</th>
                    <th style="width: 120px">V. Total $</th>
                    <th style="width: 80px">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="wizardData.cooperanteItems.length === 0">
                    <td colspan="5" class="text-center text-muted">No se han registrado aportes de la entidad.</td>
                  </tr>
                  <tr v-for="(cItem, idx) in wizardData.cooperanteItems" :key="idx">
                    <td class="font-bold">{{ cItem.detalle }}</td>
                    <td>{{ cItem.cantidad }}</td>
                    <td>${{ cItem.valorUnitario.toFixed(2) }}</td>
                    <td class="font-bold">${{ (cItem.cantidad * cItem.valorUnitario).toFixed(2) }}</td>
                    <td>
                      <button type="button" class="btn-icon btn-delete" @click="eliminarCoopItem(idx)">🗑️</button>
                    </td>
                  </tr>
                  <tr v-if="wizardData.cooperanteItems.length > 0" class="totales-row">
                    <td colspan="3" class="font-bold">Total Aporte $</td>
                    <td class="font-bold">${{ totalAporteCoop.toFixed(2) }}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- PASO 6: CRONOGRAMA DE EJECUCIÓN -->
        <div v-else-if="currentStep === 6" class="step-pane">
          <h3 class="seccion-titulo">6. Cronograma de Ejecución</h3>
          
          <div class="formulario-inline-vue inline-grid-activity margin-bottom-md">
            <input type="text" v-model="tmpActividad.nombre" placeholder="Nombre de la actividad" />
            <input type="date" v-model="tmpActividad.fechaInicio" />
            <input type="date" v-model="tmpActividad.fechaFin" />
            <button type="button" class="btn btn-secundario btn-add-inline" @click="agregarActividad">+ Agregar</button>
          </div>

          <div class="header-table-actions margin-bottom-sm">
            <button type="button" class="btn btn-secundario btn-pequeno" @click="ordenarActividades">
              ⇅ Ordenar por fecha de inicio
            </button>
          </div>

          <table class="tabla sub-tabla">
            <thead>
              <tr>
                <th>Actividad</th>
                <th style="width: 150px">Fecha inicio</th>
                <th style="width: 150px">Fecha fin</th>
                <th style="width: 120px">Duración (días)</th>
                <th style="width: 80px">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="wizardData.actividades.length === 0">
                <td colspan="5" class="text-center text-muted">No se han registrado actividades. La nota debe tener al menos una actividad.</td>
              </tr>
              <tr v-for="(act, idx) in wizardData.actividades" :key="idx">
                <td class="font-bold">{{ act.nombre }}</td>
                <td>{{ formatearStringFecha(act.fechaInicio) }}</td>
                <td>{{ formatearStringFecha(act.fechaFin) }}</td>
                <td>{{ calcularDuracionDias(act.fechaInicio, act.fechaFin) }}</td>
                <td>
                  <button type="button" class="btn-icon btn-delete" @click="eliminarActividad(idx)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Barra de navegación del Wizard -->
      <div class="wizard-actions card margin-top-md">
        <button 
          type="button" 
          class="btn btn-secundario" 
          @click="cancelarWizard"
        >
          Cancelar
        </button>
        
        <div class="wizard-nav-buttons">
          <button 
            type="button" 
            class="btn btn-secundario" 
            :disabled="currentStep === 0" 
            @click="irAtras"
          >
            ← Atrás
          </button>
          
          <button 
            v-if="currentStep < 6" 
            type="button" 
            class="btn btn-primario" 
            @click="irSiguiente"
          >
            Siguiente →
          </button>
          
          <button 
            v-else 
            type="button" 
            class="btn btn-primario btn-register" 
            @click="registrarNotaCompleta"
          >
            ✔ Registrar Nota Conceptual
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { SistemaGestion } from '../models/SistemaGestion';
import { ConvocatoriaService } from '../services/ConvocatoriaService';
import { NotaConceptualService } from '../services/NotaConceptualService';
import { FormatUtils } from '../utils/FormatUtils';
import { IdGenerator } from '../utils/IdGenerator';
import { Director } from '../models/Director';
import { NotaConceptual } from '../models/NotaConceptual';
import { Cobertura, ETIQUETAS_COBERTURA } from '../enums/Cobertura';
import { SectorBeneficiario, ETIQUETAS_SECTOR_BENEFICIARIO } from '../enums/SectorBeneficiario';
import { SEDES_UNIDADES_ACADEMICAS } from '../data/sedesUnidadesAcademicas.data';
import { DEPARTAMENTOS } from '../data/departamentos.data';
import { ODS_LISTA, METAS_POR_ODS } from '../data/ods.data';
import { CINE_AMPLIO, CINE_ESPECIFICO_POR_AMPLIO, CINE_DETALLADO_POR_ESPECIFICO, CINE_DETALLADO_GENERICO } from '../data/cine.data';
import { PND_OBJETIVOS, POLITICAS_POR_OBJETIVO_PND } from '../data/pnd.data';
import { OE_OBJETIVOS, OE_ESTRATEGIAS } from '../data/planEstrategico.data';
import { LINEAS_INVESTIGACION } from '../data/lineasInvestigacion.data';
import { DOMINIOS_INSTITUCIONALES, DOMINIOS_ACADEMICOS } from '../data/dominiosAcademicos.data';
import { ODS } from '../models/ODS';
import { PND } from '../models/PND';
import { GAD } from '../models/GAD';
import { Departamento } from '../models/Departamento';
import { Carrera } from '../models/Carrera';
import { ImpactoEsperado } from '../models/ImpactoEsperado';
import { ItemPresupuesto } from '../models/ItemPresupuesto';
import { EntidadCooperante } from '../models/EntidadCooperante';
import { Actividad } from '../models/Actividad';
import { TipoImpacto } from '../enums/TipoImpacto';

// Servicios de Datos
const sistema = SistemaGestion.obtenerInstancia();
const convService = new ConvocatoriaService();
const notaService = new NotaConceptualService();

// Listados reactivos
const notas = shallowRef<NotaConceptual[]>(notaService.listar());
const convocatorias = shallowRef(convService.listar());
const convocatoriasAbiertas = computed(() => convocatorias.value.filter(c => c.admiteNuevasNotas()));

// Catálogos
const SEDES_UNIDADES = SEDES_UNIDADES_ACADEMICAS;
const DEPARTAMENTOS_CAT = DEPARTAMENTOS;
const ODS_LIST = ODS_LISTA;
const CINE_AMPLIO_CAT = CINE_AMPLIO;
const PND_OBJETIVOS_CAT = PND_OBJETIVOS;
const OE_OBJETIVOS_CAT = OE_OBJETIVOS;
const OE_ESTRATEGIAS_CAT = OE_ESTRATEGIAS;
const LINEAS_INVEST_CAT = LINEAS_INVESTIGACION;
const DOMINIOS_INST_CAT = DOMINIOS_INSTITUCIONALES;
const DOMINIOS_ACAD_CAT = DOMINIOS_ACADEMICOS;

// Conversiones checkbox a arrays
const COBERTURAS = Object.values(Cobertura).map(val => ({ val, label: ETIQUETAS_COBERTURA[val] }));
const SECTORES_BENEF = Object.values(SectorBeneficiario).map(val => ({ val, label: ETIQUETAS_SECTOR_BENEFICIARIO[val] }));

// Navegación e identificación del Wizard
const mostrandoWizard = ref(false);
const editandoNotaId = ref<string | null>(null);
const currentStep = ref(0);

const pasos = [
  'Convocatoria',
  'Datos Generales',
  'Alineamiento',
  'Participantes',
  'Impactos',
  'Presupuesto',
  'Cronograma'
];

// Estructura de formulario vacía
const crearWizardState = () => ({
  convocatoriaId: '',
  nombre: '',
  sedeUnidadAcademica: '',
  departamento: '',
  fechaInicioPlanificada: '',
  fechaFinPlanificada: '',
  directorNombre: '',
  directorCorreo: '',
  directorTelefono: '',
  cobertura: [] as Cobertura[],
  localizacion: {
    provincia: '',
    canton: '',
    parroquia: '',
    barrioComunidad: ''
  },
  sectorBeneficiario: [] as SectorBeneficiario[],
  alineamiento: {
    ambitos: [
      { nombre: "Desarrollo Territorial y Fortalecimiento Comunitario", aplica: false },
      { nombre: "Sostenibilidad Ambiental y Green University", aplica: false },
      { nombre: "Innovación Social y Resiliencia Territorial", aplica: false }
    ],
    ods: [] as { codigo: string, metaSeleccionada: string }[],
    cineAmplio: '',
    cineEspecifico: '',
    cineDetallado: '',
    pndObjetivo: '',
    pndPolitica: '',
    gadProvincial: '',
    gadCantonal: '',
    gadParroquial: '',
    gadEntidadAuspiciante: '',
    peiObjetivo: '',
    peiEstrategia: '',
    lineasInvestigacion: [] as string[],
    dominioInstitucional: '',
    dominioAcademico: ''
  },
  departamentosParticipantes: [] as { sede: string, nombre: string, objetivo: string, docentes: number }[],
  carrerasParticipantes: [] as { sede: string, nombre: string, objetivo: string, estudiantes: number }[],
  impactos: [
    { tipo: TipoImpacto.ECONOMICO, tipoNombre: 'Económico', descBase: 'Mejoramiento de condiciones económicas de la población objetivo.', descripcion: 'Mejoramiento de condiciones económicas de la población objetivo.' },
    { tipo: TipoImpacto.SOCIAL, tipoNombre: 'Social', descBase: 'Mejoramiento de condiciones de vida de la población objetivo en aspectos de salud, educación, seguridad, vivienda, servicios básicos, etc.', descripcion: 'Mejoramiento de condiciones de vida de la población objetivo en aspectos de salud, educación, seguridad, vivienda, servicios básicos, etc.' },
    { tipo: TipoImpacto.POLITICO, tipoNombre: 'Político', descBase: 'Impacto generado por las alianzas estratégicas mediante los acuerdos, convenios y cartas de compromiso con las entidades públicas y privadas para el cumplimiento de las políticas públicas del Estado.', descripcion: 'Impacto generado por las alianzas estratégicas mediante los acuerdos, convenios y cartas de compromiso con las entidades públicas y privadas para el cumplimiento de las políticas públicas del Estado.' },
    { tipo: TipoImpacto.CIENTIFICO, tipoNombre: 'Científico', descBase: 'Efecto generado por el aporte teórico y práctico de los nuevos conocimientos, como resultado de la implementación de proyectos sociales y pueden ser divulgados a través de diferentes publicaciones oficiales.', descripcion: 'Efecto generado por el aporte teórico y práctico de los nuevos conocimientos, como resultado de la implementación de proyectos sociales y pueden ser divulgados a través de diferentes publicaciones oficiales.' },
    { tipo: TipoImpacto.AMBIENTAL, tipoNombre: 'Ambiental', descBase: 'Efecto generado por las buenas prácticas de políticas ambientales determinados durante la implementación de proyectos sociales en el territorio. Efecto generado por la implementación de políticas de conservación y mitigación del medio ambiente en los sectores urbanos y rurales a través de los proyectos.', descripcion: 'Efecto generado por las buenas prácticas de políticas ambientales determinados durante la implementación de proyectos sociales en el territorio. Efecto generado por la implementación de políticas de conservación y mitigación del medio ambiente en los sectores urbanos y rurales a través de los proyectos.' },
    { tipo: TipoImpacto.OTROS, tipoNombre: 'Otros impactos', descBase: 'Otros posibles impactos que el proyecto podría generar al finalizar la ejecución.', descripcion: 'Otros posibles impactos que el proyecto podría generar al finalizar la ejecución.' }
  ],
  poblacion: {
    referencia: 0,
    potencial: 0,
    objetivo: 0
  },
  presupuestoItems: [] as { nro: string, descripcion: string, bienServicio: string, cantidad: number, valorUnitario: number }[],
  cooperanteNombre: '',
  cooperanteItems: [] as { detalle: string, cantidad: number, valorUnitario: number }[],
  actividades: [] as { nombre: string, fechaInicio: string, fechaFin: string }[]
});

const wizardData = ref(crearWizardState());

// Variables temporales para campos agregables
const tmpOds = ref({ odsId: '', metaId: '' });
const tmpLinea = ref('');
const tmpDepto = ref({ sede: '', nombre: '', objetivo: '', docentes: 1 });
const tmpCarrera = ref({ sede: '', nombre: '', objetivo: '', estudiantes: 1 });
const tmpItem = ref({ nro: '', descripcion: '', bienServicio: '', cantidad: 1, valorUnitario: 0 });
const tmpCoop = ref({ detalle: '', cantidad: 1, valorUnitario: 0 });
const tmpActividad = ref({ nombre: '', fechaInicio: '', fechaFin: '' });

// Validaciones reactivas
const errorPoblacion = ref('');

// Cómputos dinámicos en cascada
const metasFiltradas = computed(() => {
  if (!tmpOds.value.odsId) return [];
  return METAS_POR_ODS[tmpOds.value.odsId] || [];
});

const cineEspecificoFiltrado = computed(() => {
  if (!wizardData.value.alineamiento.cineAmplio) return [];
  return CINE_ESPECIFICO_POR_AMPLIO[wizardData.value.alineamiento.cineAmplio] || [];
});

const cineDetalladoFiltrado = computed(() => {
  if (!wizardData.value.alineamiento.cineEspecifico) return [];
  return CINE_DETALLADO_POR_ESPECIFICO[wizardData.value.alineamiento.cineEspecifico] || CINE_DETALLADO_GENERICO;
});

const pndPoliticasFiltradas = computed(() => {
  if (!wizardData.value.alineamiento.pndObjetivo) return [];
  return POLITICAS_POR_OBJECTIVO_PND_CORREGIDO(wizardData.value.alineamiento.pndObjetivo);
});

// Corrección para evitar errores de tipeado de clave de diccionario
function POLITICAS_POR_OBJECTIVO_PND_CORREGIDO(key: string) {
  return POLITICAS_POR_OBJETIVO_PND[key] || [];
}

function obtenerNombreConvocatoria(id: string): string {
  const c = convocatorias.value.find(conv => conv.id === id);
  return c ? c.nombre : 'Desconocida';
}

function formatearFecha(date: Date): string {
  return FormatUtils.formatearFecha(date);
}

function formatearStringFecha(dateStr: string): string {
  if (!dateStr) return '';
  return FormatUtils.formatearFecha(FormatUtils.desdeFechaInput(dateStr));
}

// Lógica de ODS
function onOdsChange() {
  tmpOds.value.metaId = '';
}
function onCineAmplioChange() {
  wizardData.value.alineamiento.cineEspecifico = '';
  wizardData.value.alineamiento.cineDetallado = '';
}
function onCineEspecificoChange() {
  wizardData.value.alineamiento.cineDetallado = '';
}
function onPndChange() {
  wizardData.value.alineamiento.pndPolitica = '';
}

function obtenerDefinicionAmbito(nombre: string): string {
  if (nombre === "Desarrollo Territorial y Fortalecimiento Comunitario") {
    return "Soluciones participativas que impulsen la gobernanza, inclusión social, desarrollo sostenible y el fortalecimiento de capacidades locales.";
  } else if (nombre === "Sostenibilidad Ambiental y Green University") {
    return "Gestión responsable de recursos y prácticas ambientales sostenibles alineadas con los Objetivos de Desarrollo Sostenible (ODS) y la estrategia institucional de campus verde.";
  } else {
    return "Proyectos enfocados en la transformación digital, apropiación del conocimiento, adaptación al riesgo y resiliencia comunitaria frente a cambios del entorno.";
  }
}

// Agregar elementos dinámicos
function agregarOds() {
  if (!tmpOds.value.odsId || !tmpOds.value.metaId) {
    alert("Seleccione tanto el Objetivo ODS como la Meta.");
    return;
  }
  if (wizardData.value.alineamiento.ods.length >= 2) {
    alert("Solo se permiten hasta 2 objetivos ODS.");
    return;
  }
  if (wizardData.value.alineamiento.ods.some(o => o.codigo === tmpOds.value.odsId)) {
    alert("Este ODS ya ha sido agregado.");
    return;
  }
  const odsSel = ODS_LIST.find(o => o.codigo === tmpOds.value.odsId)!;
  const metaSel = metasFiltradas.value.find(m => m.codigo === tmpOds.value.metaId)!;
  wizardData.value.alineamiento.ods.push({
    codigo: tmpOds.value.odsId,
    metaSeleccionada: `${odsSel.texto} - Meta: ${metaSel.texto}`
  });
  tmpOds.value = { odsId: '', metaId: '' };
}

function eliminarOds(codigo: string) {
  wizardData.value.alineamiento.ods = wizardData.value.alineamiento.ods.filter(o => o.codigo !== codigo);
}

function agregarLinea() {
  if (!tmpLinea.value) {
    alert("Seleccione una línea de investigación.");
    return;
  }
  if (wizardData.value.alineamiento.lineasInvestigacion.length >= 2) {
    alert("Solo se permiten hasta 2 líneas de investigación.");
    return;
  }
  if (wizardData.value.alineamiento.lineasInvestigacion.includes(tmpLinea.value)) {
    alert("Esta línea ya ha sido agregada.");
    return;
  }
  wizardData.value.alineamiento.lineasInvestigacion.push(tmpLinea.value);
  tmpLinea.value = '';
}

function eliminarLinea(l: string) {
  wizardData.value.alineamiento.lineasInvestigacion = wizardData.value.alineamiento.lineasInvestigacion.filter(x => x !== l);
}

function agregarDeptoParticipante() {
  const { sede, nombre, objetivo, docentes } = tmpDepto.value;
  if (!sede || !nombre || !objetivo || docentes <= 0) {
    alert("Complete todos los campos del departamento con valores correctos (Nro. docentes > 0).");
    return;
  }
  wizardData.value.departamentosParticipantes.push({ sede, nombre, objetivo, docentes });
  tmpDepto.value = { sede: '', nombre: '', objetivo: '', docentes: 1 };
}

function eliminarDeptoParticipante(idx: number) {
  wizardData.value.departamentosParticipantes.splice(idx, 1);
}

const totalDocentesParticipantes = computed(() => {
  return wizardData.value.departamentosParticipantes.reduce((sum, d) => sum + d.docentes, 0);
});

function agregarCarreraParticipante() {
  const { sede, nombre, objetivo, estudiantes } = tmpCarrera.value;
  if (!sede || !nombre || !objetivo || estudiantes <= 0) {
    alert("Complete todos los campos de la carrera con valores correctos (Nro. estudiantes > 0).");
    return;
  }
  wizardData.value.carrerasParticipantes.push({ sede, nombre, objetivo, estudiantes });
  tmpCarrera.value = { sede: '', nombre: '', objetivo: '', estudiantes: 1 };
}

function eliminarCarreraParticipante(idx: number) {
  wizardData.value.carrerasParticipantes.splice(idx, 1);
}

const totalEstudiantesParticipantes = computed(() => {
  return wizardData.value.carrerasParticipantes.reduce((sum, c) => sum + c.estudiantes, 0);
});

// Población Beneficiaria
function validarJerarquiaPoblacion() {
  const { referencia, potencial, objetivo } = wizardData.value.poblacion;
  if (objetivo > potencial || potencial > referencia) {
    errorPoblacion.value = "La población objetivo debe ser menor o igual a la potencial, y esta menor o igual a la de referencia.";
  } else {
    errorPoblacion.value = "";
  }
}

// Financiamiento y Presupuesto
function agregarItemPresupuesto() {
  const { nro, descripcion, bienServicio, cantidad, valorUnitario } = tmpItem.value;
  if (!nro || !descripcion || !bienServicio) {
    alert("Complete el nro., descripción y bien/servicio.");
    return;
  }
  if (cantidad <= 0) {
    alert("La cantidad del ítem debe ser mayor que cero.");
    return;
  }
  if (valorUnitario < 0) {
    alert("El valor unitario del ítem no puede ser negativo.");
    return;
  }
  
  // Validar tope de presupuesto antes de agregar
  const itemTotal = cantidad * valorUnitario;
  if (totalPresupuesto.value + itemTotal > 20000) {
    alert("El presupuesto total acumulado por nota no puede superar los USD 20,000.");
    return;
  }

  wizardData.value.presupuestoItems.push({ nro, descripcion, bienServicio, cantidad, valorUnitario });
  tmpItem.value = { nro: '', descripcion: '', bienServicio: '', cantidad: 1, valorUnitario: 0 };
}

function eliminarItemPresupuesto(idx: number) {
  wizardData.value.presupuestoItems.splice(idx, 1);
}

const totalPresupuesto = computed(() => {
  return wizardData.value.presupuestoItems.reduce((sum, i) => sum + (i.cantidad * i.valorUnitario), 0);
});

function agregarCoopItem() {
  const { detalle, cantidad, valorUnitario } = tmpCoop.value;
  if (!detalle || cantidad <= 0 || valorUnitario < 0) {
    alert("Complete detalle, cantidad (>0) y valor unitario (>=0).");
    return;
  }
  wizardData.value.cooperanteItems.push({ detalle, cantidad, valorUnitario });
  tmpCoop.value = { detalle: '', cantidad: 1, valorUnitario: 0 };
}

function eliminarCoopItem(idx: number) {
  wizardData.value.cooperanteItems.splice(idx, 1);
}

const totalAporteCoop = computed(() => {
  return wizardData.value.cooperanteItems.reduce((sum, c) => sum + (c.cantidad * c.valorUnitario), 0);
});

// Cronograma de Actividades
function agregarActividad() {
  const { nombre, fechaInicio, fechaFin } = tmpActividad.value;
  if (!nombre || !fechaInicio || !fechaFin) {
    alert("Debe indicar el nombre de la actividad y las fechas de inicio y fin.");
    return;
  }
  const inicioDate = FormatUtils.desdeFechaInput(fechaInicio);
  const finDate = FormatUtils.desdeFechaInput(fechaFin);
  
  if (finDate.getTime() <= inicioDate.getTime()) {
    alert("La fecha fin de la actividad debe ser posterior a su fecha de inicio.");
    return;
  }

  // Validar que esté dentro de las fechas de la nota
  const noteInicio = FormatUtils.desdeFechaInput(wizardData.value.fechaInicioPlanificada);
  const noteFin = FormatUtils.desdeFechaInput(wizardData.value.fechaFinPlanificada);
  if (inicioDate.getTime() < noteInicio.getTime() || finDate.getTime() > noteFin.getTime()) {
    alert("La actividad debe encontrarse dentro del período de ejecución planificado de la nota conceptual.");
    return;
  }

  wizardData.value.actividades.push({ nombre, fechaInicio, fechaFin });
  tmpActividad.value = { nombre: '', fechaInicio: '', fechaFin: '' };
}

function eliminarActividad(idx: number) {
  wizardData.value.actividades.splice(idx, 1);
}

function ordenarActividades() {
  wizardData.value.actividades.sort((a, b) => {
    return new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime();
  });
}

function calcularDuracionDias(inicioStr: string, finStr: string): number {
  if (!inicioStr || !finStr) return 0;
  const diffTime = Math.abs(new Date(finStr).getTime() - new Date(inicioStr).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusivo
}

// Iniciar Wizard Creación
function iniciarCreacion() {
  if (convocatoriasAbiertas.value.length === 0) {
    alert("No hay convocatorias abiertas disponibles. Cree o active una convocatoria antes de proceder.");
    return;
  }
  editandoNotaId.value = null;
  wizardData.value = crearWizardState();
  // Auto-seleccionar si solo hay una convocatoria abierta
  if (convocatoriasAbiertas.value.length === 1) {
    wizardData.value.convocatoriaId = convocatoriasAbiertas.value[0].id;
  }
  currentStep.value = 0;
  mostrandoWizard.value = true;
}

// Iniciar Wizard Edición
function iniciarEdicion(n: NotaConceptual) {
  editandoNotaId.value = n.id;
  
  // Cargar datos
  const alineamiento = n.alineamiento;
  const poblacion = n.poblacionBeneficiaria;
  const presupuesto = n.presupuesto;
  const cronograma = n.cronograma;

  wizardData.value = {
    convocatoriaId: n.convocatoriaId,
    nombre: n.nombre,
    sedeUnidadAcademica: n.sedeUnidadAcademica,
    departamento: n.departamento || '',
    fechaInicioPlanificada: FormatUtils.aFechaInput(n.fechaInicioPlanificada),
    fechaFinPlanificada: FormatUtils.aFechaInput(n.fechaFinPlanificada),
    directorNombre: n.director.nombres,
    directorCorreo: n.director.correo,
    directorTelefono: n.director.telefono,
    cobertura: [...n.cobertura],
    localizacion: { ...n.localizacion },
    sectorBeneficiario: [...n.sectorBeneficiario],
    alineamiento: {
      ambitos: alineamiento.ambitosPrioritarios.map(a => ({ nombre: a.nombre, aplica: a.aplica })),
      ods: alineamiento.ods.map(o => ({ codigo: o.codigo, metaSeleccionada: o.metaSeleccionada })),
      cineAmplio: alineamiento.cineAmplio,
      cineEspecifico: alineamiento.cineEspecifico,
      cineDetallado: alineamiento.cineDetallado,
      pndObjetivo: alineamiento.pnd ? alineamiento.pnd.codigoObjetivo : '',
      pndPolitica: alineamiento.pnd ? alineamiento.pnd.politicaSeleccionada : '',
      gadProvincial: alineamiento.objetivosGAD.find(g => g.nivel === 'Provincial')?.objetivo || '',
      gadCantonal: alineamiento.objetivosGAD.find(g => g.nivel === 'Cantonal')?.objetivo || '',
      gadParroquial: alineamiento.objetivosGAD.find(g => g.nivel === 'Parroquial')?.objetivo || '',
      gadEntidadAuspiciante: alineamiento.objetivoEntidadCooperante || '',
      peiObjetivo: alineamiento.objetivoPlanEstrategico,
      peiEstrategia: alineamiento.estrategiaPlanEstrategico,
      lineasInvestigacion: [...alineamiento.lineasInvestigacion],
      dominioInstitucional: alineamiento.dominioInstitucional,
      dominioAcademico: alineamiento.dominioAcademico
    },
    departamentosParticipantes: n.departamentosParticipantes.map(d => ({
      sede: d.sedeUnidadAcademica,
      nombre: d.nombre,
      objetivo: d.objetivoNota,
      docentes: d.nroDocentesPlanificados
    })),
    carrerasParticipantes: n.carrerasParticipantes.map(c => ({
      sede: c.sedeUnidadAcademica,
      nombre: c.nombre,
      objetivo: c.objetivoNota,
      estudiantes: c.nroEstudiantesPlanificados
    })),
    impactos: n.impactosEsperados.map(i => {
      let tNm = '';
      if (i.tipo === TipoImpacto.ECONOMICO) tNm = 'Económico';
      else if (i.tipo === TipoImpacto.SOCIAL) tNm = 'Social';
      else if (i.tipo === TipoImpacto.POLITICO) tNm = 'Político';
      else if (i.tipo === TipoImpacto.CIENTIFICO) tNm = 'Científico';
      else if (i.tipo === TipoImpacto.AMBIENTAL) tNm = 'Ambiental';
      else tNm = 'Otros impactos';
      return {
        tipo: i.tipo,
        tipoNombre: tNm,
        descBase: i.obtenerDescripcionBase(),
        descripcion: i.descripcion
      };
    }),
    poblacion: {
      referencia: poblacion.poblacionReferencia,
      potencial: poblacion.poblacionPotencial,
      objetivo: poblacion.poblacionObjetivo
    },
    presupuestoItems: presupuesto.items.map(i => ({
      nro: i.nroItem,
      descripcion: i.descripcionItem,
      bienServicio: i.nombreBienServicio,
      cantidad: i.cantidad,
      valorUnitario: i.valorUnitario
    })),
    cooperanteNombre: presupuesto.entidadCooperante ? presupuesto.entidadCooperante.nombre : '',
    cooperanteItems: presupuesto.entidadCooperante ? presupuesto.entidadCooperante.items.map(i => ({
      detalle: i.descripcionItem,
      cantidad: i.cantidad,
      valorUnitario: i.valorUnitario
    })) : [],
    actividades: cronograma.actividades.map(a => ({
      nombre: a.nombre,
      fechaInicio: FormatUtils.aFechaInput(a.fechaInicio),
      fechaFin: FormatUtils.aFechaInput(a.fechaFin)
    }))
  };

  currentStep.value = 1; // Saltar selección de convocatoria
  mostrandoWizard.value = true;
}

// Cancelar Wizard
function cancelarWizard() {
  if (confirm("¿Seguro que desea salir del formulario? Se perderán los datos no guardados.")) {
    mostrandoWizard.value = false;
    editandoNotaId.value = null;
  }
}

// Navegación secuencial con validación
function irAtras() {
  if (currentStep.value > 0) {
    if (editandoNotaId.value && currentStep.value === 1) {
      // Si edita, saltar paso 0
      return;
    }
    currentStep.value--;
  }
}

function irAPasoDirecto(index: number) {
  if (editandoNotaId.value) {
    if (index === 0) return; // No permitir volver a seleccionar convocatoria
    currentStep.value = index;
  }
}

function irSiguiente() {
  // Validaciones según paso
  if (currentStep.value === 0) {
    if (!wizardData.value.convocatoriaId) {
      alert("Debe seleccionar una convocatoria obligatoria.");
      return;
    }
  } 
  else if (currentStep.value === 1) {
    const { nombre, sedeUnidadAcademica, departamento, fechaInicioPlanificada, fechaFinPlanificada, directorNombre, directorCorreo, directorTelefono } = wizardData.value;
    if (!nombre || !sedeUnidadAcademica || !departamento || !fechaInicioPlanificada || !fechaFinPlanificada || !directorNombre || !directorCorreo || !directorTelefono) {
      alert("Por favor, complete todos los campos obligatorios del proyecto y del docente responsable.");
      return;
    }
    if (!directorCorreo.includes("@")) {
      alert("El correo electrónico del director debe contener '@'.");
      return;
    }
    // Validar rango de fechas de la nota contra las fechas de la convocatoria
    const conv = convocatorias.value.find(c => c.id === wizardData.value.convocatoriaId)!;
    const iniNote = FormatUtils.desdeFechaInput(fechaInicioPlanificada);
    const finNote = FormatUtils.desdeFechaInput(fechaFinPlanificada);
    if (iniNote.getTime() < conv.fechaInicio.getTime() || finNote.getTime() > conv.fechaFin.getTime()) {
      alert(`Las fechas planificadas deben estar dentro del período de la convocatoria: ${formatearFecha(conv.fechaInicio)} al ${formatearFecha(conv.fechaFin)}.`);
      return;
    }
    if (finNote.getTime() <= iniNote.getTime()) {
      alert("La fecha de finalización debe ser posterior a la fecha de inicio.");
      return;
    }
  } 
  else if (currentStep.value === 2) {
    const alMenosUnAmbito = wizardData.value.alineamiento.ambitos.some(a => a.aplica);
    if (!alMenosUnAmbito) {
      alert("Debe seleccionar al menos un ámbito prioritario de actuación.");
      return;
    }
  } 
  else if (currentStep.value === 4) {
    const { referencia, potencial, objetivo } = wizardData.value.poblacion;
    if (!referencia || referencia <= 0 || !potencial || potencial <= 0 || !objetivo || objetivo <= 0) {
      alert("Es obligatorio colocar la Población de Referencia, Potencial y Objetivo (Beneficiario directo) con valores mayores a cero antes de avanzar.");
      return;
    }
    validarJerarquiaPoblacion();
    if (errorPoblacion.value) {
      alert(errorPoblacion.value);
      return;
    }
  } 
  else if (currentStep.value === 5) {
    if (totalPresupuesto.value <= 0) {
      alert("Debe registrar al menos un ítem en el presupuesto detallado.");
      return;
    }
    if (totalPresupuesto.value > 20000) {
      alert("El presupuesto no puede superar los USD 20,000.");
      return;
    }
  }

  currentStep.value++;
}

// Confirmación Final de Creación / Edición
function registrarNotaCompleta() {
  // Validación de Actividades en el Cronograma
  if (wizardData.value.actividades.length === 0) {
    alert("El cronograma debe tener al menos una actividad registrada.");
    return;
  }

  const { convocatoriaId, nombre, sedeUnidadAcademica, departamento, fechaInicioPlanificada, fechaFinPlanificada, directorNombre, directorCorreo, directorTelefono } = wizardData.value;
  const convObj = convocatorias.value.find(c => c.id === convocatoriaId)!;
  const iniDate = FormatUtils.desdeFechaInput(fechaInicioPlanificada);
  const finDate = FormatUtils.desdeFechaInput(fechaFinPlanificada);

  if (editandoNotaId.value) {
    // ACTUALIZACIÓN DE NOTA EXISTENTE
    const nota = sistema.notasConceptuales.find(n => n.id === editandoNotaId.value)!;
    
    // Asignar campos principales
    nota.nombre = nombre;
    nota.sedeUnidadAcademica = sedeUnidadAcademica;
    nota.departamento = departamento;
    nota.fechaInicioPlanificada = iniDate;
    nota.fechaFinPlanificada = finDate;
    
    // Director
    nota.director.nombres = directorNombre;
    nota.director.correo = directorCorreo;
    nota.director.telefono = directorTelefono;
    nota.director.departamento = departamento;

    // Cobertura y sector
    nota.cobertura = [...wizardData.value.cobertura];
    nota.sectorBeneficiario = [...wizardData.value.sectorBeneficiario];
    nota.localizacion = { ...wizardData.value.localizacion };

    // Alineamiento
    const al = nota.alineamiento;
    al.ambitosPrioritarios.forEach((a, i) => {
      a.aplica = wizardData.value.alineamiento.ambitos[i].aplica;
    });
    // Ods reset y add
    al.ods.length = 0;
    wizardData.value.alineamiento.ods.forEach(o => {
      al.agregarODS(new ODS(o.codigo, '', o.metaSeleccionada));
    });
    al.cineAmplio = wizardData.value.alineamiento.cineAmplio;
    al.cineEspecifico = wizardData.value.alineamiento.cineEspecifico;
    al.cineDetallado = wizardData.value.alineamiento.cineDetallado;
    al.pnd = wizardData.value.alineamiento.pndObjetivo ? new PND(wizardData.value.alineamiento.pndObjetivo, '', wizardData.value.alineamiento.pndPolitica) : null;
    al.objetivosGAD.forEach(g => {
      if (g.nivel === 'Provincial') g.objetivo = wizardData.value.alineamiento.gadProvincial;
      if (g.nivel === 'Cantonal') g.objetivo = wizardData.value.alineamiento.gadCantonal;
      if (g.nivel === 'Parroquial') g.objetivo = wizardData.value.alineamiento.gadParroquial;
    });
    al.objetivoEntidadCooperante = wizardData.value.alineamiento.gadEntidadAuspiciante;
    al.objetivoPlanEstrategico = wizardData.value.alineamiento.peiObjetivo;
    al.estrategiaPlanEstrategico = wizardData.value.alineamiento.peiEstrategia;
    al.lineasInvestigacion.length = 0;
    wizardData.value.alineamiento.lineasInvestigacion.forEach(l => al.agregarLineaInvestigacion(l));
    al.dominioInstitucional = wizardData.value.alineamiento.dominioInstitucional;
    al.dominioAcademico = wizardData.value.alineamiento.dominioAcademico;

    // Departamentos participantes
    nota.departamentosParticipantes.length = 0;
    wizardData.value.departamentosParticipantes.forEach(d => {
      nota.departamentosParticipantes.push(new Departamento(IdGenerator.generar("DEPTO"), d.nombre, d.sede, d.objetivo, d.docentes));
    });

    // Carreras participantes
    nota.carrerasParticipantes.length = 0;
    wizardData.value.carrerasParticipantes.forEach(c => {
      nota.carrerasParticipantes.push(new Carrera(IdGenerator.generar("CARR"), c.nombre, c.sede, c.objetivo, c.estudiantes));
    });

    // Impactos
    nota.impactosEsperados.forEach((imp, i) => {
      imp.descripcion = wizardData.value.impactos[i].descripcion;
    });

    // Población
    nota.poblacionBeneficiaria.poblacionReferencia = wizardData.value.poblacion.referencia;
    nota.poblacionBeneficiaria.poblacionPotencial = wizardData.value.poblacion.potencial;
    nota.poblacionBeneficiaria.poblacionObjetivo = wizardData.value.poblacion.objetivo;

    // Presupuesto
    nota.presupuesto.items.length = 0;
    wizardData.value.presupuestoItems.forEach(i => {
      nota.presupuesto.agregarItem(new ItemPresupuesto(IdGenerator.generar("ITEM"), i.nro, i.descripcion, i.bienServicio, i.cantidad, i.valorUnitario));
    });
    if (wizardData.value.cooperanteNombre) {
      const coop = new EntidadCooperante(IdGenerator.generar("COOP"), wizardData.value.cooperanteNombre);
      wizardData.value.cooperanteItems.forEach(item => {
        coop.agregarItem(new ItemPresupuesto(IdGenerator.generar("ITEM"), '', item.detalle, '', item.cantidad, item.valorUnitario));
      });
      nota.presupuesto.entidadCooperante = coop;
    } else {
      nota.presupuesto.entidadCooperante = null;
    }

    // Cronograma
    nota.cronograma.actividades.length = 0;
    wizardData.value.actividades.forEach(a => {
      nota.cronograma.agregar(new Actividad(IdGenerator.generar("ACT"), a.nombre, FormatUtils.desdeFechaInput(a.fechaInicio), FormatUtils.desdeFechaInput(a.fechaFin)));
    });

    alert(`Nota conceptual ${nota.codigo} modificada exitosamente.`);
  } else {
    // CREACIÓN DE NUEVA NOTA
    const res = notaService.crear(nombre, sedeUnidadAcademica, departamento, directorNombre, directorCorreo, directorTelefono, iniDate, finDate, convObj);
    if (!res.valido || !res.nota) {
      alert(res.mensaje || "Error al crear la nota conceptual.");
      return;
    }

    const nota = res.nota;

    // Cobertura y sector
    nota.cobertura = [...wizardData.value.cobertura];
    nota.sectorBeneficiario = [...wizardData.value.sectorBeneficiario];
    nota.localizacion = { ...wizardData.value.localizacion };

    // Alineamiento
    const al = nota.alineamiento;
    al.ambitosPrioritarios.forEach((a, i) => {
      a.aplica = wizardData.value.alineamiento.ambitos[i].aplica;
    });
    wizardData.value.alineamiento.ods.forEach(o => {
      al.agregarODS(new ODS(o.codigo, '', o.metaSeleccionada));
    });
    al.cineAmplio = wizardData.value.alineamiento.cineAmplio;
    al.cineEspecifico = wizardData.value.alineamiento.cineEspecifico;
    al.cineDetallado = wizardData.value.alineamiento.cineDetallado;
    al.pnd = wizardData.value.alineamiento.pndObjetivo ? new PND(wizardData.value.alineamiento.pndObjetivo, '', wizardData.value.alineamiento.pndPolitica) : null;
    al.objetivosGAD.forEach(g => {
      if (g.nivel === 'Provincial') g.objetivo = wizardData.value.alineamiento.gadProvincial;
      if (g.nivel === 'Cantonal') g.objetivo = wizardData.value.alineamiento.gadCantonal;
      if (g.nivel === 'Parroquial') g.objetivo = wizardData.value.alineamiento.gadParroquial;
    });
    al.objetivoEntidadCooperante = wizardData.value.alineamiento.gadEntidadAuspiciante;
    al.objetivoPlanEstrategico = wizardData.value.alineamiento.peiObjetivo;
    al.estrategiaPlanEstrategico = wizardData.value.alineamiento.peiEstrategia;
    wizardData.value.alineamiento.lineasInvestigacion.forEach(l => al.agregarLineaInvestigacion(l));
    al.dominioInstitucional = wizardData.value.alineamiento.dominioInstitucional;
    al.dominioAcademico = wizardData.value.alineamiento.dominioAcademico;

    // Departamentos participantes
    wizardData.value.departamentosParticipantes.forEach(d => {
      nota.departamentosParticipantes.push(new Departamento(IdGenerator.generar("DEPTO"), d.nombre, d.sede, d.objetivo, d.docentes));
    });

    // Carreras participantes
    wizardData.value.carrerasParticipantes.forEach(c => {
      nota.carrerasParticipantes.push(new Carrera(IdGenerator.generar("CARR"), c.nombre, c.sede, c.objetivo, c.estudiantes));
    });

    // Impactos
    nota.impactosEsperados.forEach((imp, i) => {
      imp.descripcion = wizardData.value.impactos[i].descripcion;
    });

    // Población
    nota.poblacionBeneficiaria.poblacionReferencia = wizardData.value.poblacion.referencia;
    nota.poblacionBeneficiaria.poblacionPotencial = wizardData.value.poblacion.potencial;
    nota.poblacionBeneficiaria.poblacionObjetivo = wizardData.value.poblacion.objetivo;

    // Presupuesto
    wizardData.value.presupuestoItems.forEach(i => {
      nota.presupuesto.agregarItem(new ItemPresupuesto(IdGenerator.generar("ITEM"), i.nro, i.descripcion, i.bienServicio, i.cantidad, i.valorUnitario));
    });
    if (wizardData.value.cooperanteNombre) {
      const coop = new EntidadCooperante(IdGenerator.generar("COOP"), wizardData.value.cooperanteNombre);
      wizardData.value.cooperanteItems.forEach(item => {
        coop.agregarItem(new ItemPresupuesto(IdGenerator.generar("ITEM"), '', item.detalle, '', item.cantidad, item.valorUnitario));
      });
      nota.presupuesto.entidadCooperante = coop;
    }

    // Cronograma
    wizardData.value.actividades.forEach(a => {
      nota.cronograma.agregar(new Actividad(IdGenerator.generar("ACT"), a.nombre, FormatUtils.desdeFechaInput(a.fechaInicio), FormatUtils.desdeFechaInput(a.fechaFin)));
    });

    alert(`Nota conceptual ${nota.codigo} registrada correctamente.`);
  }

  // Refrescar listado y salir
  notas.value = notaService.listar();
  mostrandoWizard.value = false;
  editandoNotaId.value = null;
}

function eliminarNota(id: string) {
  if (confirm("¿Está seguro de eliminar esta nota conceptual?")) {
    const res = notaService.eliminar(id);
    if (!res.valido) {
      alert(res.mensaje);
    }
    notas.value = notaService.listar();
  }
}
</script>

<style scoped>
.notas-view {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-lg);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions h2 {
  margin: 0;
  color: var(--color-primario-oscuro);
  font-size: 1.5rem;
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tabla th, .tabla td {
  padding: var(--espaciado-md);
  border-bottom: 1px solid var(--color-borde);
  font-size: 0.9rem;
}

.tabla th {
  background-color: var(--color-fondo);
  color: var(--color-primario-oscuro);
  font-weight: 600;
}

.code-column {
  color: var(--color-primario);
}

.price-tag {
  color: var(--color-primario-oscuro);
}

.acciones-header {
  text-align: right;
}

.acciones-celda {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaciado-sm);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radio-sm);
  transition: background-color var(--transicion-rapida);
}

.btn-icon:hover {
  background-color: var(--color-fondo);
}

/* WIZARD STYLES */
.wizard-header {
  padding: var(--espaciado-lg);
  border-left: 5px solid var(--color-primario);
}

.wizard-title-group h2 {
  margin: 0 0 4px 0;
  color: var(--color-primario-oscuro);
}

.wizard-subtitle {
  font-size: 0.85rem;
  color: var(--color-texto-suave);
}

.wizard-steps-indicator {
  display: flex;
  justify-content: space-between;
  margin-top: var(--espaciado-lg);
  border-top: 1px solid var(--color-borde);
  padding-top: var(--espaciado-md);
  overflow-x: auto;
  gap: var(--espaciado-md);
}

.step-indicator-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex: 1;
  min-width: 90px;
}

.step-indicator-item.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-borde);
  background-color: var(--color-superficie);
  color: var(--color-texto-suave);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all var(--transicion-rapida);
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-texto-suave);
  text-align: center;
  white-space: nowrap;
}

.step-indicator-item.active .step-number {
  border-color: var(--color-primario);
  background-color: var(--color-primario);
  color: #ffffff;
}

.step-indicator-item.active .step-label {
  color: var(--color-primario);
}

.step-indicator-item.completed .step-number {
  border-color: var(--color-primario-claro);
  background-color: var(--color-exito-fondo);
  color: var(--color-primario-claro);
}

.wizard-step-content {
  padding: var(--espaciado-xl);
  min-height: 350px;
}

.sub-form-section {
  border-top: 1px solid var(--color-borde);
  padding-top: var(--espaciado-lg);
}

.sub-form-section h4 {
  margin: 0 0 var(--espaciado-md) 0;
  color: var(--color-primario);
  font-size: 1rem;
  border-bottom: 2px solid var(--color-dorado);
  padding-bottom: 6px;
}

.sub-form-section h5 {
  margin: 0 0 var(--espaciado-sm) 0;
  color: var(--color-primario-oscuro);
  font-size: 0.92rem;
}

.help-text {
  font-size: 0.8rem;
  color: var(--color-texto-suave);
  margin-top: 4px;
  display: block;
}

.input-full, .textarea-full {
  width: 100%;
}

.radio-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: var(--espaciado-md);
  font-size: 0.88rem;
  font-weight: 600;
}

.formulario-inline-vue {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaciado-md);
  align-items: flex-end;
  background-color: var(--color-fondo);
  padding: var(--espaciado-md);
  border-radius: var(--radio-sm);
}

.inline-grid-depto {
  display: grid;
  grid-template-columns: 150px 1fr 1fr 110px auto;
}

.inline-grid-budget {
  display: grid;
  grid-template-columns: 90px 1fr 1fr 80px 100px auto;
}

.inline-grid-budget-coop {
  display: grid;
  grid-template-columns: 1fr 100px 120px auto;
}

.inline-grid-activity {
  display: grid;
  grid-template-columns: 1fr 150px 150px auto;
}

.btn-add-inline {
  height: 38px;
}

.added-list {
  list-style: none;
  padding: 0;
  margin: var(--espaciado-md) 0 0 0;
}

.added-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px var(--espaciado-md);
  background-color: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-sm);
  margin-bottom: var(--espaciado-xs);
  font-size: 0.88rem;
}

.btn-text-delete {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-weight: bold;
}

.totales-row {
  background-color: var(--color-fondo);
}

.totales-row td {
  border-bottom: 2px solid var(--color-primario);
}

.budget-limit-status {
  padding: var(--espaciado-md);
  background-color: var(--color-exito-fondo);
  color: var(--color-primario-oscuro);
  border-radius: var(--radio-sm);
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  border-left: 5px solid var(--color-primario);
}

.budget-limit-status.exceeded {
  background-color: var(--color-error-fondo);
  color: var(--color-error);
  border-left-color: var(--color-error);
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  padding: var(--espaciado-lg);
}

.wizard-nav-buttons {
  display: flex;
  gap: var(--espaciado-md);
}

.btn-register {
  background-color: var(--color-primario-claro);
  border-color: var(--color-primario-claro);
}

.btn-register:hover {
  background-color: var(--color-primario);
  border-color: var(--color-primario);
}

.font-bold {
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: var(--color-texto-suave);
}

.text-xs {
  font-size: 0.78rem;
}

.margin-top-sm {
  margin-top: var(--espaciado-sm);
}
.margin-top-md {
  margin-top: var(--espaciado-md);
}
.margin-top-lg {
  margin-top: var(--espaciado-lg);
}
.margin-top-xl {
  margin-top: var(--espaciado-xl);
}
.margin-bottom-sm {
  margin-bottom: var(--espaciado-sm);
}
.margin-bottom-md {
  margin-bottom: var(--espaciado-md);
}

.max-width-md {
  max-width: 500px;
}

.grid-4-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--espaciado-md);
}

.grid-3-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--espaciado-md);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
