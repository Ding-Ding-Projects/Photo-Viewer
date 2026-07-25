/* File System Access API: TS lib.dom ships the handle types but not the picker entry points. */
interface Window {
  showDirectoryPicker?: (options?: { id?: string; mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>
}
