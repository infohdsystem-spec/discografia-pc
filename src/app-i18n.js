/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Sistema i18n + Intl
   Autor: HDSystem IT · Tel: +54 9 11 4563-0851
   ========================================================================= */

const I18N_CONFIG_KEY = 'discografia_i18n_v1';
const INTL_CONFIG_KEY = 'discografia_intl_v1';

const LANGUAGES = [
  { code: 'es', name: 'Español',    flag: '🇦🇷', short: 'ES', locale: 'es-AR' },
  { code: 'en', name: 'English',    flag: '🇺🇸', short: 'EN', locale: 'en-US' },
  { code: 'pt', name: 'Português',  flag: '🇧🇷', short: 'PT', locale: 'pt-BR' }
];

const I18N = {
  es: {
    'header.new_cd': 'Nuevo CD',
    'header.category': 'Categoría',
    'header.import': 'Importar',
    'header.export': 'Exportar',
    'header.dashboard': 'Panel',
    'header.enrich': 'Enriquecer',
    'header.pending': 'Pendientes',
    'header.exit': 'Salir',
    'header.toggle_theme': 'Cambiar tema (Ctrl+Shift+T)',
    'header.scan': 'Escanear código de barras',
    'header.search_placeholder': 'Buscar… (podés usar artist:, year:>, genre:, tag:)',
    'header.filters': 'Filtros avanzados (Ctrl+F)',
    'toolbar.new_cd': 'Nuevo CD (Ctrl+N)',
    'toolbar.new_category': 'Nueva categoría (Ctrl+K)',
    'toolbar.undo': 'Deshacer (Ctrl+Z)',
    'toolbar.history': 'Historial (Ctrl+Shift+H)',
    'toolbar.help': 'Manual (F1)',
    'toolbar.more': 'Más opciones',
    'toolbar.dashboard_tip': 'Panel de control (Ctrl+D)',
    'toolbar.grid_tip': 'Vista cuadrícula (Ctrl+G)',
    'toolbar.enrich_tip': 'Enriquecer (Ctrl+E)',
    'toolbar.pending_tip': 'Ver CDs pendientes',
    'toolbar.labels_tip': 'Etiquetas imprimibles (Ctrl+Shift+P)',
    'filter.state': 'Estado',
    'filter.format': 'Formato',
    'filter.year_from': 'Año desde',
    'filter.year_to': 'Año hasta',
    'filter.location': 'Ubicación',
    'filter.cover': 'Portada',
    'filter.loan': 'Préstamo',
    'filter.clear': '✕ Limpiar',
    'filter.all': 'Todos',
    'filter.all_f': 'Todas',
    'filter.with': 'Con',
    'filter.without': 'Sin',
    'filter.loaned': 'Prestados',
    'filter.available': 'Disponibles',
    'filter.overdue': 'Vencidos',
    'tab.all': 'Todas',
    'tab.new_category': 'Nueva categoría',
    'tab.new_subcategory': 'Subcategoría',
    'tab.create_first_subcategory': 'Crear primera subcategoría',
    'empty.title': 'Tu base de datos está vacía',
    'empty.description': 'Esta versión no incluye ninguna categoría: creá las tuyas desde cero. También podés importar una copia de seguridad JSON si ya tenías datos.',
    'empty.create_first': '📁 Crear primera categoría',
    'empty.import_file': '📥 Importar archivo',
    'empty.file_picker': '📂 Selector de archivos',
    'empty.paste_json': '📋 Pegar JSON',
    'empty.view_manual': '❓ Ver manual',
    'empty.drop_zone': '⬇️ …o arrastrá y soltá el archivo .json / .csv acá',
    'panel.list': 'Listado',
    'panel.artists': 'Intérpretes',
    'panel.count_all': 'Todos',
    'panel.filtered': 'filtrado',
    'panel.filtering_by': 'Filtrando por',
    'panel.see_all': '✕ Ver todos',
    'col.nro': 'Nro',
    'col.title': 'Título',
    'col.artist': 'Intérprete',
    'col.year': 'Año',
    'col.actions': 'Acciones',
    'sel.selected': 'seleccionados',
    'sel.state': '🏷️ Estado',
    'sel.location': '📍 Ubicación',
    'sel.move': '📁 Mover',
    'sel.covers': '🖼️ Portadas',
    'sel.labels': '🏷️ Etiquetas',
    'sel.delete': '🗑️ Eliminar',
    'sel.cancel': '✕ Cancelar',
    'modal.new_cd': 'Nuevo CD',
    'modal.edit_cd': 'Editar CD',
    'modal.title': '🎵 Título del álbum *',
    'modal.artist': '🎤 Intérprete *',
    'modal.category': '📁 Categoría',
    'modal.subcategory': '📂 Subcategoría',
    'modal.nro': 'Nº *',
    'modal.year_album': 'Año álbum',
    'modal.cover': 'Portada',
    'modal.no_cover': 'Sin portada',
    'modal.search': '🔍 Buscar',
    'modal.url': '✏️ URL',
    'modal.enrich_auto': '✨ Buscar información y portada automáticamente',
    'modal.replace_data': '🔄 Reemplazar datos existentes',
    'modal.tab.edition': '📀 Edición',
    'modal.tab.physical': '🔍 Estado físico',
    'modal.tab.location': '📍 Ubicación y valor',
    'modal.tab.loan': '📚 Préstamo',
    'modal.tab.custom': '📝 Personalizados',
    'modal.save': '💾 Guardar',
    'modal.save_and_new': '💾 Guardar y nuevo',
    'modal.cancel': 'Cancelar',
    'view.title': 'Detalles del CD',
    'view.edit': '✏️ Editar',
    'view.close': 'Cerrar',
    'view.loaned_to': 'Prestado a',
    'view.due_date': 'Fecha devolución',
    'view.overdue': 'VENCIDO',
    'history.title': 'Historial de actividad',
    'history.all_actions': 'Todas las acciones',
    'history.creates': 'Creaciones',
    'history.edits': 'Ediciones',
    'history.deletes': 'Eliminaciones',
    'history.imports': 'Importaciones',
    'history.enriches': 'Enriquecimientos',
    'history.loans': 'Préstamos',
    'history.exports': 'Exportaciones',
    'history.search_placeholder': 'Buscar…',
    'history.clear': '🗑️ Limpiar',
    'history.no_activity': 'Sin actividad registrada',
    'history.export_csv': '📊 Exportar CSV',
    'history.close': 'Cerrar',
    'loans.title': 'CDs prestados',
    'loans.no_loans': 'No hay CDs prestados actualmente',
    'loans.export_csv': '📊 Exportar CSV',
    'loans.close': 'Cerrar',
    'loans.return': '↩️ Devolver',
    'loans.due': 'Devolución',
    'loans.overdue_tag': '(VENCIDO)',
    'loans.summary_one': '{n} CD prestado',
    'loans.summary_many': '{n} CDs prestados',
    'loans.overdue_one': '{n} vencido',
    'loans.overdue_many': '{n} vencidos',
    'dup.title': 'Detección de duplicados',
    'dup.merge': '🔀 Fusionar',
    'dup.export_csv': '📊 Exportar CSV',
    'dup.no_duplicates': 'No se detectaron duplicados',
    'dup.analyzed': 'analizados',
    'dup.with_threshold': 'con umbral',
    'dup.groups_one': '{n} grupo',
    'dup.groups_many': '{n} grupos',
    'dup.of_possible_duplicates': 'de posibles duplicados',
    'dup.cds_involved': 'CDs involucrados',
    'dup.similarity': 'similitud',
    'dup.merge_title': 'Fusionar duplicados',
    'dup.merge_primary': 'CD primario (se conserva)',
    'dup.merge_secondary': 'CD secundario (se elimina)',
    'dup.merge_keep_a': 'Mantener del primario',
    'dup.merge_use_b': 'Usar del secundario',
    'dup.merge_confirm': '🔀 Fusionar',
    'dup.merge_no_diffs': '✅ Los campos mergeables son idénticos. Solo se unirán links, campos personalizados y provenance.',
    'labels.title': 'Etiquetas imprimibles',
    'labels.format': '📐 Formato',
    'labels.fields': '📝 Campos a mostrar',
    'labels.qr': '📱 QR',
    'labels.include_qr': 'Incluir código QR en cada etiqueta',
    'labels.qr_content': 'Contenido del QR',
    'labels.qr_url': 'Abrir CD en la app (URL)',
    'labels.qr_text': 'Texto plano (título, intérprete, año)',
    'labels.scope': '🎯 Alcance',
    'labels.scope_selection': 'Selección actual',
    'labels.scope_filtered': 'Resultado filtrado',
    'labels.scope_category': 'Categoría actual',
    'labels.scope_all': 'Toda la colección',
    'labels.font_scale': '🔍 Escala de fuente',
    'labels.preview': '👁️ Vista previa',
    'labels.print': '🖨️ Imprimir etiquetas',
    'labels.cancel': 'Cancelar',
    'labels.count_one': '{n} etiqueta',
    'labels.count_many': '{n} etiquetas',
    'labels.pages_one': '{n} página',
    'labels.pages_many': '{n} páginas',
    'menu.system': 'Sistema',
    'menu.owner_config': '👤 Datos del propietario',
    'menu.discogs_config': '🎚️ Configurar Discogs',
    'menu.lastfm_config': '🎵 Configurar Last.fm',
    'menu.folder_config': '📁 Carpeta predeterminada',
    'menu.labels_cat': '🏷️ Etiquetas de la categoría actual',
    'menu.clear_cache': '🧹 Vaciar caché de metadatos',
    'menu.network_diag': '🩺 Diagnóstico de red',
    'menu.force_update': '🔄 Buscar actualización',
    'menu.reload': '🔄 Recargar app',
    'menu.language': '🌎 Idioma',
    'menu.legal': 'Legal',
    'menu.show_legal': '⚖️ Términos y aviso legal',
    'menu.export_legal_pdf': '📄 Guardar aviso legal (PDF)',
    'menu.danger': 'Zona de peligro',
    'menu.reset': '🗑️ Vaciar base de datos',
    'exp.backup': 'Copia de seguridad',
    'exp.full_json': '💾 JSON completo',
    'exp.current_cat': 'Categoría actual',
    'exp.cat_json': '📄 JSON de categoría',
    'exp.cat_csv': '📊 CSV (Excel)',
    'exp.cat_md': '📝 Texto con formato',
    'exp.cat_pdf': '📄 PDF (con portadas)',
    'exp.location': 'Ubicación',
    'exp.folder_view': '📂 Ver carpeta predeterminada',
    'exp.folder_config': '⚙️ Configurar carpeta…',
    'exp.labels_all': '🏷️ Etiquetas (toda la colección)',
    'exp.print': '🖨️ Imprimir',
    'exp.auto_backup': '💾 Copia de seguridad automática',
    'imp.title': 'Importar datos',
    'imp.from_file': '📁 Desde archivo',
    'imp.from_folder': '📂 Abrir desde carpeta predeterminada',
    'imp.file_picker': '🗂️ Selector de archivos',
    'imp.paste_json': '📋 Pegar JSON',
    'imp.folder_config': '⚙️ Configurar carpeta predeterminada',
    'toast.saved': '💾 Guardado',
    'toast.deleted': 'Eliminado',
    'toast.copied': 'Copiado',
    'toast.error': 'Error',
    'toast.warning': 'Atención',
    'toast.info': 'Info',
    'toast.cd_created': 'CD agregado',
    'toast.cd_updated': 'CD actualizado',
    'toast.cd_deleted': 'CD eliminado',
    'toast.category_created': 'Categoría creada',
    'toast.category_renamed': 'Renombrada',
    'toast.category_deleted': 'Categoría eliminada',
    'toast.nothing_to_undo': 'Nada que deshacer',
    'toast.undone': 'Deshecho',
    'toast.no_results': 'Sin resultados',
    'toast.invalid_json': 'JSON inválido',
    'toast.file_downloaded': '📥 Archivo descargado',
    'toast.backup_done': '✅ Backup completado',
    'toast.cache_cleared': '🧹 Caché vaciada',
    'toast.theme_light': '☀️ Tema claro',
    'toast.theme_dark': '🌙 Tema oscuro',
    'toast.migration_done': '🔄 Backup migrado',
    'toast.new_version': '🆕 Nueva versión disponible',
    'toast.reload_now': '🔄 Recargar',
    'footer.total': 'CDs en total',
    'footer.no_changes': 'Sin cambios guardados',
    'footer.author': 'Autor',
    'footer.phone': 'Tel',
    'settings.language': 'Idioma',
    'settings.language_changed': 'Idioma cambiado',
    'unit.cd': 'CD',
    'unit.cds': 'CDs',
    'unit.artist': 'intérprete',
    'unit.artists': 'intérpretes',
    'unit.category': 'categoría',
    'unit.categories': 'categorías',
    'unit.year': 'año',
    'unit.years': 'años',
    'unit.change': 'cambio',
    'unit.changes': 'cambios',
    'unit.file': 'archivo',
    'unit.files': 'archivos',
    'unit.page': 'página',
    'unit.pages': 'páginas',
    'unit.label': 'etiqueta',
    'unit.labels': 'etiquetas',
    'unit.group': 'grupo',
    'unit.groups': 'grupos',
    'unit.with_value': '{n} con valor',
    'unit.cds_per_artist': '{n} CDs/int.',
    'unit.years_count': '{n} años',
    'date.today': 'Hoy',
    'date.yesterday': 'Ayer',
    'date.days_ago': 'Hace {n} días',
    'date.weeks_ago': 'Hace {n} semanas',
    'date.months_ago': 'Hace {n} meses',
    'date.years_ago': 'Hace {n} años',
    'date.just_now': 'Ahora',
    'err.network': 'Error de red',
    'err.timeout': 'Timeout',
    'err.offline': 'Sin conexión a internet',
    'err.not_found': 'No encontrado',
    'err.invalid_input': 'Entrada inválida',
  },
  en: {
    'header.new_cd': 'New CD',
    'header.category': 'Category',
    'header.import': 'Import',
    'header.export': 'Export',
    'header.dashboard': 'Dashboard',
    'header.enrich': 'Enrich',
    'header.pending': 'Pending',
    'header.exit': 'Exit',
    'header.toggle_theme': 'Toggle theme (Ctrl+Shift+T)',
    'header.scan': 'Scan barcode',
    'header.search_placeholder': 'Search… (use artist:, year:>, genre:, tag:)',
    'header.filters': 'Advanced filters (Ctrl+F)',
    'toolbar.new_cd': 'New CD (Ctrl+N)',
    'toolbar.new_category': 'New category (Ctrl+K)',
    'toolbar.undo': 'Undo (Ctrl+Z)',
    'toolbar.history': 'History (Ctrl+Shift+H)',
    'toolbar.help': 'Manual (F1)',
    'toolbar.more': 'More options',
    'toolbar.dashboard_tip': 'Dashboard (Ctrl+D)',
    'toolbar.grid_tip': 'Grid view (Ctrl+G)',
    'toolbar.enrich_tip': 'Enrich (Ctrl+E)',
    'toolbar.pending_tip': 'View pending CDs',
    'toolbar.labels_tip': 'Printable labels (Ctrl+Shift+P)',
    'filter.state': 'State',
    'filter.format': 'Format',
    'filter.year_from': 'Year from',
    'filter.year_to': 'Year to',
    'filter.location': 'Location',
    'filter.cover': 'Cover',
    'filter.loan': 'Loan',
    'filter.clear': '✕ Clear',
    'filter.all': 'All',
    'filter.all_f': 'All',
    'filter.with': 'With',
    'filter.without': 'Without',
    'filter.loaned': 'Loaned',
    'filter.available': 'Available',
    'filter.overdue': 'Overdue',
    'tab.all': 'All',
    'tab.new_category': 'New category',
    'tab.new_subcategory': 'Subcategory',
    'tab.create_first_subcategory': 'Create first subcategory',
    'empty.title': 'Your database is empty',
    'empty.description': 'This version does not include any category: create your own from scratch. You can also import a JSON backup if you had data before.',
    'empty.create_first': '📁 Create first category',
    'empty.import_file': '📥 Import file',
    'empty.file_picker': '📂 File picker',
    'empty.paste_json': '📋 Paste JSON',
    'empty.view_manual': '❓ View manual',
    'empty.drop_zone': '⬇️ …or drag and drop the .json / .csv file here',
    'panel.list': 'List',
    'panel.artists': 'Artists',
    'panel.count_all': 'All',
    'panel.filtered': 'filtered',
    'panel.filtering_by': 'Filtering by',
    'panel.see_all': '✕ See all',
    'col.nro': 'No.',
    'col.title': 'Title',
    'col.artist': 'Artist',
    'col.year': 'Year',
    'col.actions': 'Actions',
    'sel.selected': 'selected',
    'sel.state': '🏷️ State',
    'sel.location': '📍 Location',
    'sel.move': '📁 Move',
    'sel.covers': '🖼️ Covers',
    'sel.labels': '🏷️ Labels',
    'sel.delete': '🗑️ Delete',
    'sel.cancel': '✕ Cancel',
    'modal.new_cd': 'New CD',
    'modal.edit_cd': 'Edit CD',
    'modal.title': '🎵 Album title *',
    'modal.artist': '🎤 Artist *',
    'modal.category': '📁 Category',
    'modal.subcategory': '📂 Subcategory',
    'modal.nro': 'No. *',
    'modal.year_album': 'Album year',
    'modal.cover': 'Cover',
    'modal.no_cover': 'No cover',
    'modal.search': '🔍 Search',
    'modal.url': '✏️ URL',
    'modal.enrich_auto': '✨ Search for info and cover automatically',
    'modal.replace_data': '🔄 Replace existing data',
    'modal.tab.edition': '📀 Edition',
    'modal.tab.physical': '🔍 Physical state',
    'modal.tab.location': '📍 Location and value',
    'modal.tab.loan': '📚 Loan',
    'modal.tab.custom': '📝 Custom',
    'modal.save': '💾 Save',
    'modal.save_and_new': '💾 Save and new',
    'modal.cancel': 'Cancel',
    'view.title': 'CD details',
    'view.edit': '✏️ Edit',
    'view.close': 'Close',
    'view.loaned_to': 'Loaned to',
    'view.due_date': 'Due date',
    'view.overdue': 'OVERDUE',
    'history.title': 'Activity history',
    'history.all_actions': 'All actions',
    'history.creates': 'Creations',
    'history.edits': 'Edits',
    'history.deletes': 'Deletions',
    'history.imports': 'Imports',
    'history.enriches': 'Enrichments',
    'history.loans': 'Loans',
    'history.exports': 'Exports',
    'history.search_placeholder': 'Search…',
    'history.clear': '🗑️ Clear',
    'history.no_activity': 'No activity recorded',
    'history.export_csv': '📊 Export CSV',
    'history.close': 'Close',
    'loans.title': 'Loaned CDs',
    'loans.no_loans': 'No CDs currently loaned',
    'loans.export_csv': '📊 Export CSV',
    'loans.close': 'Close',
    'loans.return': '↩️ Return',
    'loans.due': 'Due',
    'loans.overdue_tag': '(OVERDUE)',
    'loans.summary_one': '{n} CD loaned',
    'loans.summary_many': '{n} CDs loaned',
    'loans.overdue_one': '{n} overdue',
    'loans.overdue_many': '{n} overdue',
    'dup.title': 'Duplicate detection',
    'dup.merge': '🔀 Merge',
    'dup.export_csv': '📊 Export CSV',
    'dup.no_duplicates': 'No duplicates detected',
    'dup.analyzed': 'analyzed',
    'dup.with_threshold': 'with threshold',
    'dup.groups_one': '{n} group',
    'dup.groups_many': '{n} groups',
    'dup.of_possible_duplicates': 'of possible duplicates',
    'dup.cds_involved': 'CDs involved',
    'dup.similarity': 'similarity',
    'dup.merge_title': 'Merge duplicates',
    'dup.merge_primary': 'Primary CD (kept)',
    'dup.merge_secondary': 'Secondary CD (deleted)',
    'dup.merge_keep_a': 'Keep from primary',
    'dup.merge_use_b': 'Use from secondary',
    'dup.merge_confirm': '🔀 Merge',
    'dup.merge_no_diffs': '✅ Mergeable fields are identical. Only links, custom fields and provenance will be joined.',
    'labels.title': 'Printable labels',
    'labels.format': '📐 Format',
    'labels.fields': '📝 Fields to show',
    'labels.qr': '📱 QR',
    'labels.include_qr': 'Include QR code on each label',
    'labels.qr_content': 'QR content',
    'labels.qr_url': 'Open CD in app (URL)',
    'labels.qr_text': 'Plain text (title, artist, year)',
    'labels.scope': '🎯 Scope',
    'labels.scope_selection': 'Current selection',
    'labels.scope_filtered': 'Filtered result',
    'labels.scope_category': 'Current category',
    'labels.scope_all': 'Whole collection',
    'labels.font_scale': '🔍 Font scale',
    'labels.preview': '👁️ Preview',
    'labels.print': '🖨️ Print labels',
    'labels.cancel': 'Cancel',
    'labels.count_one': '{n} label',
    'labels.count_many': '{n} labels',
    'labels.pages_one': '{n} page',
    'labels.pages_many': '{n} pages',
    'menu.system': 'System',
    'menu.owner_config': '👤 Owner data',
    'menu.discogs_config': '🎚️ Configure Discogs',
    'menu.lastfm_config': '🎵 Configure Last.fm',
    'menu.folder_config': '📁 Default folder',
    'menu.labels_cat': '🏷️ Labels for current category',
    'menu.clear_cache': '🧹 Clear metadata cache',
    'menu.network_diag': '🩺 Network diagnostics',
    'menu.force_update': '🔄 Check for update',
    'menu.reload': '🔄 Reload app',
    'menu.language': '🌎 Language',
    'menu.legal': 'Legal',
    'menu.show_legal': '⚖️ Terms and legal notice',
    'menu.export_legal_pdf': '📄 Save legal notice (PDF)',
    'menu.danger': 'Danger zone',
    'menu.reset': '🗑️ Wipe database',
    'exp.backup': 'Backup',
    'exp.full_json': '💾 Full JSON',
    'exp.current_cat': 'Current category',
    'exp.cat_json': '📄 Category JSON',
    'exp.cat_csv': '📊 CSV (Excel)',
    'exp.cat_md': '📝 Formatted text',
    'exp.cat_pdf': '📄 PDF (with covers)',
    'exp.location': 'Location',
    'exp.folder_view': '📂 View default folder',
    'exp.folder_config': '⚙️ Configure folder…',
    'exp.labels_all': '🏷️ Labels (whole collection)',
    'exp.print': '🖨️ Print',
    'exp.auto_backup': '💾 Automatic backup',
    'imp.title': 'Import data',
    'imp.from_file': '📁 From file',
    'imp.from_folder': '📂 Open from default folder',
    'imp.file_picker': '🗂️ File picker',
    'imp.paste_json': '📋 Paste JSON',
    'imp.folder_config': '⚙️ Configure default folder',
    'toast.saved': '💾 Saved',
    'toast.deleted': 'Deleted',
    'toast.copied': 'Copied',
    'toast.error': 'Error',
    'toast.warning': 'Warning',
    'toast.info': 'Info',
    'toast.cd_created': 'CD added',
    'toast.cd_updated': 'CD updated',
    'toast.cd_deleted': 'CD deleted',
    'toast.category_created': 'Category created',
    'toast.category_renamed': 'Renamed',
    'toast.category_deleted': 'Category deleted',
    'toast.nothing_to_undo': 'Nothing to undo',
    'toast.undone': 'Undone',
    'toast.no_results': 'No results',
    'toast.invalid_json': 'Invalid JSON',
    'toast.file_downloaded': '📥 File downloaded',
    'toast.backup_done': '✅ Backup completed',
    'toast.cache_cleared': '🧹 Cache cleared',
    'toast.theme_light': '☀️ Light theme',
    'toast.theme_dark': '🌙 Dark theme',
    'toast.migration_done': '🔄 Backup migrated',
    'toast.new_version': '🆕 New version available',
    'toast.reload_now': '🔄 Reload',
    'footer.total': 'CDs total',
    'footer.no_changes': 'No changes saved',
    'footer.author': 'Author',
    'footer.phone': 'Phone',
    'settings.language': 'Language',
    'settings.language_changed': 'Language changed',
    'unit.cd': 'CD',
    'unit.cds': 'CDs',
    'unit.artist': 'artist',
    'unit.artists': 'artists',
    'unit.category': 'category',
    'unit.categories': 'categories',
    'unit.year': 'year',
    'unit.years': 'years',
    'unit.change': 'change',
    'unit.changes': 'changes',
    'unit.file': 'file',
    'unit.files': 'files',
    'unit.page': 'page',
    'unit.pages': 'pages',
    'unit.label': 'label',
    'unit.labels': 'labels',
    'unit.group': 'group',
    'unit.groups': 'groups',
    'unit.with_value': '{n} with value',
    'unit.cds_per_artist': '{n} CDs/artist',
    'unit.years_count': '{n} years',
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.days_ago': '{n} days ago',
    'date.weeks_ago': '{n} weeks ago',
    'date.months_ago': '{n} months ago',
    'date.years_ago': '{n} years ago',
    'date.just_now': 'Just now',
    'err.network': 'Network error',
    'err.timeout': 'Timeout',
    'err.offline': 'No internet connection',
    'err.not_found': 'Not found',
    'err.invalid_input': 'Invalid input',
  },
  pt: {
    'header.new_cd': 'Novo CD',
    'header.category': 'Categoria',
    'header.import': 'Importar',
    'header.export': 'Exportar',
    'header.dashboard': 'Painel',
    'header.enrich': 'Enriquecer',
    'header.pending': 'Pendentes',
    'header.exit': 'Sair',
    'header.toggle_theme': 'Alternar tema (Ctrl+Shift+T)',
    'header.scan': 'Escanear código de barras',
    'header.search_placeholder': 'Buscar… (use artist:, year:>, genre:, tag:)',
    'header.filters': 'Filtros avançados (Ctrl+F)',
    'toolbar.new_cd': 'Novo CD (Ctrl+N)',
    'toolbar.new_category': 'Nova categoria (Ctrl+K)',
    'toolbar.undo': 'Desfazer (Ctrl+Z)',
    'toolbar.history': 'Histórico (Ctrl+Shift+H)',
    'toolbar.help': 'Manual (F1)',
    'toolbar.more': 'Mais opções',
    'toolbar.dashboard_tip': 'Painel (Ctrl+D)',
    'toolbar.grid_tip': 'Vista em grade (Ctrl+G)',
    'toolbar.enrich_tip': 'Enriquecer (Ctrl+E)',
    'toolbar.pending_tip': 'Ver CDs pendentes',
    'toolbar.labels_tip': 'Etiquetas imprimíveis (Ctrl+Shift+P)',
    'filter.state': 'Estado',
    'filter.format': 'Formato',
    'filter.year_from': 'Ano de',
    'filter.year_to': 'Ano até',
    'filter.location': 'Localização',
    'filter.cover': 'Capa',
    'filter.loan': 'Empréstimo',
    'filter.clear': '✕ Limpar',
    'filter.all': 'Todos',
    'filter.all_f': 'Todas',
    'filter.with': 'Com',
    'filter.without': 'Sem',
    'filter.loaned': 'Emprestados',
    'filter.available': 'Disponíveis',
    'filter.overdue': 'Atrasados',
    'tab.all': 'Todas',
    'tab.new_category': 'Nova categoria',
    'tab.new_subcategory': 'Subcategoria',
    'tab.create_first_subcategory': 'Criar primeira subcategoria',
    'empty.title': 'Sua base de dados está vazia',
    'empty.description': 'Esta versão não inclui nenhuma categoria: crie as suas do zero. Você também pode importar um backup JSON se já tinha dados.',
    'empty.create_first': '📁 Criar primeira categoria',
    'empty.import_file': '📥 Importar arquivo',
    'empty.file_picker': '📂 Seletor de arquivos',
    'empty.paste_json': '📋 Colar JSON',
    'empty.view_manual': '❓ Ver manual',
    'empty.drop_zone': '⬇️ …ou arraste e solte o arquivo .json / .csv aqui',
    'panel.list': 'Lista',
    'panel.artists': 'Artistas',
    'panel.count_all': 'Todos',
    'panel.filtered': 'filtrado',
    'panel.filtering_by': 'Filtrando por',
    'panel.see_all': '✕ Ver todos',
    'col.nro': 'Nº',
    'col.title': 'Título',
    'col.artist': 'Artista',
    'col.year': 'Ano',
    'col.actions': 'Ações',
    'sel.selected': 'selecionados',
    'sel.state': '🏷️ Estado',
    'sel.location': '📍 Localização',
    'sel.move': '📁 Mover',
    'sel.covers': '🖼️ Capas',
    'sel.labels': '🏷️ Etiquetas',
    'sel.delete': '🗑️ Excluir',
    'sel.cancel': '✕ Cancelar',
    'modal.new_cd': 'Novo CD',
    'modal.edit_cd': 'Editar CD',
    'modal.title': '🎵 Título do álbum *',
    'modal.artist': '🎤 Artista *',
    'modal.category': '📁 Categoria',
    'modal.subcategory': '📂 Subcategoria',
    'modal.nro': 'Nº *',
    'modal.year_album': 'Ano do álbum',
    'modal.cover': 'Capa',
    'modal.no_cover': 'Sem capa',
    'modal.search': '🔍 Buscar',
    'modal.url': '✏️ URL',
    'modal.enrich_auto': '✨ Buscar informações e capa automaticamente',
    'modal.replace_data': '🔄 Substituir dados existentes',
    'modal.tab.edition': '📀 Edição',
    'modal.tab.physical': '🔍 Estado físico',
    'modal.tab.location': '📍 Localização e valor',
    'modal.tab.loan': '📚 Empréstimo',
    'modal.tab.custom': '📝 Personalizados',
    'modal.save': '💾 Salvar',
    'modal.save_and_new': '💾 Salvar e novo',
    'modal.cancel': 'Cancelar',
    'view.title': 'Detalhes do CD',
    'view.edit': '✏️ Editar',
    'view.close': 'Fechar',
    'view.loaned_to': 'Emprestado a',
    'view.due_date': 'Data de devolução',
    'view.overdue': 'ATRASADO',
    'history.title': 'Histórico de atividades',
    'history.all_actions': 'Todas as ações',
    'history.creates': 'Criações',
    'history.edits': 'Edições',
    'history.deletes': 'Exclusões',
    'history.imports': 'Importações',
    'history.enriches': 'Enriquecimentos',
    'history.loans': 'Empréstimos',
    'history.exports': 'Exportações',
    'history.search_placeholder': 'Buscar…',
    'history.clear': '🗑️ Limpar',
    'history.no_activity': 'Sem atividade registrada',
    'history.export_csv': '📊 Exportar CSV',
    'history.close': 'Fechar',
    'loans.title': 'CDs emprestados',
    'loans.no_loans': 'Nenhum CD emprestado atualmente',
    'loans.export_csv': '📊 Exportar CSV',
    'loans.close': 'Fechar',
    'loans.return': '↩️ Devolver',
    'loans.due': 'Devolução',
    'loans.overdue_tag': '(ATRASADO)',
    'loans.summary_one': '{n} CD emprestado',
    'loans.summary_many': '{n} CDs emprestados',
    'loans.overdue_one': '{n} atrasado',
    'loans.overdue_many': '{n} atrasados',
    'dup.title': 'Detecção de duplicados',
    'dup.merge': '🔀 Mesclar',
    'dup.export_csv': '📊 Exportar CSV',
    'dup.no_duplicates': 'Nenhum duplicado detectado',
    'dup.analyzed': 'analisados',
    'dup.with_threshold': 'com limiar',
    'dup.groups_one': '{n} grupo',
    'dup.groups_many': '{n} grupos',
    'dup.of_possible_duplicates': 'de possíveis duplicados',
    'dup.cds_involved': 'CDs envolvidos',
    'dup.similarity': 'similaridade',
    'dup.merge_title': 'Mesclar duplicados',
    'dup.merge_primary': 'CD primário (mantido)',
    'dup.merge_secondary': 'CD secundário (excluído)',
    'dup.merge_keep_a': 'Manter do primário',
    'dup.merge_use_b': 'Usar do secundário',
    'dup.merge_confirm': '🔀 Mesclar',
    'dup.merge_no_diffs': '✅ Os campos mescláveis são idênticos. Apenas links, campos personalizados e proveniência serão unidos.',
    'labels.title': 'Etiquetas imprimíveis',
    'labels.format': '📐 Formato',
    'labels.fields': '📝 Campos a mostrar',
    'labels.qr': '📱 QR',
    'labels.include_qr': 'Incluir QR code em cada etiqueta',
    'labels.qr_content': 'Conteúdo do QR',
    'labels.qr_url': 'Abrir CD no app (URL)',
    'labels.qr_text': 'Texto puro (título, artista, ano)',
    'labels.scope': '🎯 Escopo',
    'labels.scope_selection': 'Seleção atual',
    'labels.scope_filtered': 'Resultado filtrado',
    'labels.scope_category': 'Categoria atual',
    'labels.scope_all': 'Coleção inteira',
    'labels.font_scale': '🔍 Escala da fonte',
    'labels.preview': '👁️ Pré-visualização',
    'labels.print': '🖨️ Imprimir etiquetas',
    'labels.cancel': 'Cancelar',
    'labels.count_one': '{n} etiqueta',
    'labels.count_many': '{n} etiquetas',
    'labels.pages_one': '{n} página',
    'labels.pages_many': '{n} páginas',
    'menu.system': 'Sistema',
    'menu.owner_config': '👤 Dados do proprietário',
    'menu.discogs_config': '🎚️ Configurar Discogs',
    'menu.lastfm_config': '🎵 Configurar Last.fm',
    'menu.folder_config': '📁 Pasta padrão',
    'menu.labels_cat': '🏷️ Etiquetas da categoria atual',
    'menu.clear_cache': '🧹 Limpar cache de metadados',
    'menu.network_diag': '🩺 Diagnóstico de rede',
    'menu.force_update': '🔄 Verificar atualização',
    'menu.reload': '🔄 Recarregar app',
    'menu.language': '🌎 Idioma',
    'menu.legal': 'Legal',
    'menu.show_legal': '⚖️ Termos e aviso legal',
    'menu.export_legal_pdf': '📄 Salvar aviso legal (PDF)',
    'menu.danger': 'Zona de perigo',
    'menu.reset': '🗑️ Esvaziar base de dados',
    'exp.backup': 'Backup',
    'exp.full_json': '💾 JSON completo',
    'exp.current_cat': 'Categoria atual',
    'exp.cat_json': '📄 JSON da categoria',
    'exp.cat_csv': '📊 CSV (Excel)',
    'exp.cat_md': '📝 Texto formatado',
    'exp.cat_pdf': '📄 PDF (com capas)',
    'exp.location': 'Localização',
    'exp.folder_view': '📂 Ver pasta padrão',
    'exp.folder_config': '⚙️ Configurar pasta…',
    'exp.labels_all': '🏷️ Etiquetas (coleção inteira)',
    'exp.print': '🖨️ Imprimir',
    'exp.auto_backup': '💾 Backup automático',
    'imp.title': 'Importar dados',
    'imp.from_file': '📁 Do arquivo',
    'imp.from_folder': '📂 Abrir da pasta padrão',
    'imp.file_picker': '🗂️ Seletor de arquivos',
    'imp.paste_json': '📋 Colar JSON',
    'imp.folder_config': '⚙️ Configurar pasta padrão',
    'toast.saved': '💾 Salvo',
    'toast.deleted': 'Excluído',
    'toast.copied': 'Copiado',
    'toast.error': 'Erro',
    'toast.warning': 'Atenção',
    'toast.info': 'Info',
    'toast.cd_created': 'CD adicionado',
    'toast.cd_updated': 'CD atualizado',
    'toast.cd_deleted': 'CD excluído',
    'toast.category_created': 'Categoria criada',
    'toast.category_renamed': 'Renomeada',
    'toast.category_deleted': 'Categoria excluída',
    'toast.nothing_to_undo': 'Nada para desfazer',
    'toast.undone': 'Desfeito',
    'toast.no_results': 'Sem resultados',
    'toast.invalid_json': 'JSON inválido',
    'toast.file_downloaded': '📥 Arquivo baixado',
    'toast.backup_done': '✅ Backup concluído',
    'toast.cache_cleared': '🧹 Cache limpo',
    'toast.theme_light': '☀️ Tema claro',
    'toast.theme_dark': '🌙 Tema escuro',
    'toast.migration_done': '🔄 Backup migrado',
    'toast.new_version': '🆕 Nova versão disponível',
    'toast.reload_now': '🔄 Recarregar',
    'footer.total': 'CDs no total',
    'footer.no_changes': 'Sem alterações salvas',
    'footer.author': 'Autor',
    'footer.phone': 'Tel',
    'settings.language': 'Idioma',
    'settings.language_changed': 'Idioma alterado',
    'unit.cd': 'CD',
    'unit.cds': 'CDs',
    'unit.artist': 'artista',
    'unit.artists': 'artistas',
    'unit.category': 'categoria',
    'unit.categories': 'categorias',
    'unit.year': 'ano',
    'unit.years': 'anos',
    'unit.change': 'alteração',
    'unit.changes': 'alterações',
    'unit.file': 'arquivo',
    'unit.files': 'arquivos',
    'unit.page': 'página',
    'unit.pages': 'páginas',
    'unit.label': 'etiqueta',
    'unit.labels': 'etiquetas',
    'unit.group': 'grupo',
    'unit.groups': 'grupos',
    'unit.with_value': '{n} com valor',
    'unit.cds_per_artist': '{n} CDs/artista',
    'unit.years_count': '{n} anos',
    'date.today': 'Hoje',
    'date.yesterday': 'Ontem',
    'date.days_ago': 'Há {n} dias',
    'date.weeks_ago': 'Há {n} semanas',
    'date.months_ago': 'Há {n} meses',
    'date.years_ago': 'Há {n} anos',
    'date.just_now': 'Agora',
    'err.network': 'Erro de rede',
    'err.timeout': 'Timeout',
    'err.offline': 'Sem conexão à internet',
    'err.not_found': 'Não encontrado',
    'err.invalid_input': 'Entrada inválida',
  }
};

let _currentLang = 'es';

function detectBrowserLang(){
  try {
    const raw = navigator.language || navigator.userLanguage || 'es';
    const code = String(raw).slice(0, 2).toLowerCase();
    if (I18N[code]) return code;
  } catch(e){}
  return 'es';
}

function loadLang(){
  try {
    const saved = localStorage.getItem(I18N_CONFIG_KEY);
    if (saved){
      const parsed = JSON.parse(saved);
      if (parsed && I18N[parsed.lang]) return parsed.lang;
    }
  } catch(e){}
  return detectBrowserLang();
}

function getLang(){ return _currentLang; }

function getLocale(){
  const l = LANGUAGES.find(x => x.code === _currentLang);
  return l ? l.locale : 'es-AR';
}

function setLang(code, opts = {}){
  const lang = I18N[code] ? code : 'es';
  _currentLang = lang;
  try { localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({ lang, updatedAt: new Date().toISOString() })); } catch(e){}
  document.documentElement.lang = lang;
  applyTranslations();
  if (!opts.silent){
    try { Toast.show(`${LANGUAGES.find(l => l.code === lang)?.flag || ''} ${t('settings.language_changed')}`, 'ok', 2200); } catch(e){}
  }
  if (typeof renderAll === 'function'){ try { renderAll(); } catch(e){} }
  return lang;
}

function t(key, params = {}){
  const dict = I18N[_currentLang] || I18N.es;
  let str = dict[key];
  if (str === undefined) str = I18N.es[key];
  if (str === undefined) return key;
  return format(str, params);
}

function format(str, params = {}){
  if (!params || typeof params !== 'object') return String(str);
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in params) ? String(params[k]) : m);
}

function tPlural(baseKey, n, extra = {}){
  const isOne = Number(n) === 1;
  const suffix = isOne ? '_one' : '_many';
  let key = baseKey + suffix;
  if (I18N[_currentLang]?.[key] === undefined && I18N.es[key] === undefined){
    key = isOne ? baseKey : baseKey + 's';
  }
  return t(key, { n, ...extra });
}

function tn(singularKey, pluralKey, n, extra = {}){
  return t(Number(n) === 1 ? singularKey : pluralKey, { n, ...extra });
}

function toDate(d){
  if (d === null || d === undefined || d === '') return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatDate(d, style = 'short'){
  const dt = toDate(d);
  if (!dt) return '';
  const map = {
    short:   { dateStyle: 'short' },
    medium:  { dateStyle: 'medium' },
    long:    { dateStyle: 'long' },
    numeric: { year: 'numeric', month: '2-digit', day: '2-digit' }
  };
  try { return new Intl.DateTimeFormat(getLocale(), map[style] || map.short).format(dt); }
  catch(e){ return dt.toLocaleDateString(); }
}

function formatDateTime(d){
  const dt = toDate(d);
  if (!dt) return '';
  try { return new Intl.DateTimeFormat(getLocale(), { dateStyle: 'short', timeStyle: 'short' }).format(dt); }
  catch(e){ return dt.toLocaleString(); }
}

function formatNumber(n, decimals = 0){
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  try {
    return new Intl.NumberFormat(getLocale(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch(e){ return String(num); }
}

function formatCurrency(n, currencyCode = 'ARS'){
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  try {
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(num);
  } catch(e){
    try { return new Intl.NumberFormat(getLocale(), { style: 'decimal', maximumFractionDigits: 0 }).format(num) + ' ' + currencyCode; }
    catch(e2){ return `${num} ${currencyCode}`; }
  }
}

function formatPercent(n, decimals = 0){
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  try { return new Intl.NumberFormat(getLocale(), { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(num); }
  catch(e){ return `${(num * 100).toFixed(decimals)}%`; }
}

function formatRelative(d, now = Date.now()){
  const dt = toDate(d);
  if (!dt) return '';
  const diffMs = now - dt.getTime();
  const abs = Math.abs(diffMs);
  const sec = Math.floor(abs / 1000);
  const min = Math.floor(sec / 60);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const wk  = Math.floor(day / 7);
  const mo  = Math.floor(day / 30);
  const yr  = Math.floor(day / 365);
  if (sec < 45) return t('date.just_now');
  let base;
  if (day < 1) base = t('date.just_now');
  else if (day < 2) base = t('date.yesterday');
  else if (day < 7) base = t('date.days_ago', { n: day });
  else if (wk < 5) base = t('date.weeks_ago', { n: wk });
  else if (mo < 12) base = t('date.months_ago', { n: mo });
  else base = t('date.years_ago', { n: yr });
  return base;
}

function applyTranslations(root = document){
  if (!root) return;
  const nodes = root.querySelectorAll('[data-i18n]');
  nodes.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  const titleNodes = root.querySelectorAll('[data-i18n-title]');
  titleNodes.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });
  const phNodes = root.querySelectorAll('[data-i18n-placeholder]');
  phNodes.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', t(key));
  });
  const sel = root.querySelector('#langSelector');
  if (sel) sel.value = _currentLang;
  const lbl = root.querySelector('#langSelectorLabel');
  if (lbl){
    const lang = LANGUAGES.find(l => l.code === _currentLang);
    if (lang) lbl.textContent = `${lang.flag} ${lang.name}`;
  }
}

function initI18n(){
  _currentLang = loadLang();
  document.documentElement.lang = _currentLang;
  console.log(`%c[I18N] Idioma: ${_currentLang} (${getLocale()})`, 'color:#a78bfa;font-weight:bold');
}

if (typeof window !== 'undefined'){
  window.t = t;
  window.tn = tn;
  window.tPlural = tPlural;
  window.setLang = setLang;
  window.getLang = getLang;
  window.getLocale = getLocale;
  window.applyTranslations = applyTranslations;
  window.initI18n = initI18n;
  window.format = format;
  window.formatDate = formatDate;
  window.formatDateTime = formatDateTime;
  window.formatNumber = formatNumber;
  window.formatCurrency = formatCurrency;
  window.formatPercent = formatPercent;
  window.formatRelative = formatRelative;
  window.I18N = I18N;
  window.LANGUAGES = LANGUAGES;
}