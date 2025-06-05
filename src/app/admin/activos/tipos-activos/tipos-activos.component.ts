import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoActivo } from '../../../core/models/TipoActivo';
import { TipoActivoService } from '../../../core/services/tipoactivo.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivoService } from '../../../core/services/activo.service';
import { Activo } from '../../../core/models/activo.model';

@Component({
  selector: 'app-tipos-activos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './tipos-activos.component.html',
  styleUrls: ['./tipos-activos.component.css']
})
export class TiposActivosComponent implements OnInit {
  tiposActivos: TipoActivo[] = [];
  tiposActivosFiltrados: TipoActivo[] = [];
  tipoActivoForm: FormGroup;
  detallesTipoForm: FormGroup;
  showModalCrearTipo = false;
  showModalDetallesTipo = false;
  searchTerm = '';
  isSubmitting = false;
  activeTab = 'tipoActivos';

  activosCache: Activo[] = []; // Asume que aquí están los activos cacheados
  conteoPorTipo: Record<number, number> = {};

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private tipoActivoService: TipoActivoService,
    private activoService: ActivoService // para acceder al cache
  ) {
    this.tipoActivoForm = this.fb.group({
      nombre: ['', Validators.required]
    });

    this.detallesTipoForm = this.fb.group({
      idtipoact: [null],
      nombre: ['', Validators.required],
      cantidadActivos: [0]
    });
  }

  ngOnInit(): void {
    this.cargarTiposActivos();
    this.cargarActivosCache();
  }

  cargarTiposActivos(): void {
    this.tipoActivoService.obtenerTodosLosTiposActivos().subscribe(tipos => {
      this.tiposActivos = tipos;
      this.filtrarTiposActivos();
      this.contarActivosPorTipo();
    });
  }

  filtrarTiposActivos(): void {
    const term = this.searchTerm.toLowerCase();
    this.tiposActivosFiltrados = this.tiposActivos.filter(tipo =>
      tipo.nombre.toLowerCase().includes(term)
    );
  }

  abrirModalCrearTipoActivo(): void {
    this.showModalCrearTipo = true;
    this.tipoActivoForm.reset();
  }

  cerrarModalCrearTipo(event?: Event): void {
    event?.stopPropagation();
    this.showModalCrearTipo = false;
  }

  guardarTipoActivo(): void {
    if (this.tipoActivoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const nuevoTipo = this.tipoActivoForm.value;
      this.tipoActivoService.guardarTipoActivo(nuevoTipo).subscribe({
        next: (tipoCreado) => {
          this.tiposActivos.push(tipoCreado); // Update the local array
          this.filtrarTiposActivos();
          this.cerrarModalCrearTipo();
          this.toastr.success('Tipo de activo creado exitosamente', 'Éxito');
          this.isSubmitting = false;
        },
        error: () => {
          this.toastr.error('Error al crear el tipo de activo', 'Error');
          this.isSubmitting = false;
        }
      });
    }
  }

  verDetallesTipo(tipo: TipoActivo): void {
    this.showModalDetallesTipo = true;
    this.detallesTipoForm.patchValue({
      idtipoact: tipo.idtipoact,
      nombre: tipo.nombre,
      cantidadActivos: tipo.cantidadActivos
    });
  }

  cerrarModalDetallesTipo(event?: Event): void {
    event?.stopPropagation();
    this.showModalDetallesTipo = false;
  }

  actualizarTipoActivo(): void {
    if (this.detallesTipoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const tipoActualizado = this.detallesTipoForm.value;

      this.tipoActivoService.guardarTipoActivo(tipoActualizado).subscribe({
        next: () => {
          const index = this.tiposActivos.findIndex(t => t.idtipoact === tipoActualizado.idtipoact);
          if (index !== -1) {
            // Actualizamos el objeto en su posición
            this.tiposActivos[index] = { ...tipoActualizado };
          }
          this.filtrarTiposActivos();
          this.cerrarModalDetallesTipo();
          this.toastr.success('Tipo de activo actualizado', 'Éxito');
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  eliminarTipoActivo(): void {
    if (!this.isSubmitting) {
      this.isSubmitting = true;
      const tipoId = this.detallesTipoForm.value.idtipoact;
      console.log('ID que se intenta eliminar:', tipoId);

      this.tipoActivoService.eliminarTipoActivo(tipoId).subscribe({
        next: () => {
          // Eliminar activo del array local
          this.tiposActivos = this.tiposActivos.filter(activo => activo.idtipoact !== tipoId);
          this.searchTerm = '';
          this.filtrarTiposActivos();
          this.cerrarModalDetallesTipo();
          this.toastr.warning('Tipo de activo eliminado', 'Eliminación exitosa');
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
          this.toastr.error('Error al eliminar el tipo de activo', 'Error');
        }
      });
    }
  }

  isInvalidTipo(controlName: string): boolean {
    const control = this.tipoActivoForm.get(controlName) || this.detallesTipoForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  cargarActivosCache(): void {
    this.activosCache = this.activoService.activosCache ?? [];
    this.contarActivosPorTipo();
  }

  contarActivosPorTipo(): void {
    this.conteoPorTipo = {};
    this.activosCache.forEach(activo => {
      const tipoId = activo.tipoActivo.idtipoact;
      if (typeof tipoId === 'number') {
        this.conteoPorTipo[tipoId] = (this.conteoPorTipo[tipoId] || 0) + 1;
      }
    });
  }

  getCantidadPorTipo(tipoId: number): number {
    return this.conteoPorTipo[tipoId] || 0;
  }
}