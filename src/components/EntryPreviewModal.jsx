import React, { useState, useRef } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EntryDocument from './EntryDocument.jsx'; // Importa el componente del documento
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const EntryPreviewModal = ({ open, onClose, onConfirm, entryData, isSaved }) => {
    const documentRef = useRef(); // Referencia al componente EntryDocument
    const [isSaving, setIsSaving] = useState(false); // Estado para deshabilitar botones al guardar

    // Función para activar la impresión del navegador
    const handlePrint = () => {
        window.print();
    };

    // Función para exportar el documento a PDF
    const handleExportPDF = () => {
        const input = documentRef.current; // El elemento <Paper> del EntryDocument
        if (!input) return;

        // Ocultar temporalmente el scroll del contenedor gris para captura completa
        const scrollContainer = input.closest('.print-background-container');
        const originalOverflow = scrollContainer.style.overflow;
        scrollContainer.style.overflow = 'visible'; // Permite que capture todo el alto

        html2canvas(input, {
            scale: 2, // Mejora resolución
            useCORS: true,
            scrollY: -window.scrollY, // Captura desde el inicio
            // Intenta capturar el alto total del contenido
            height: input.scrollHeight,
            windowHeight: input.scrollHeight
        }).then((canvas) => {
            // Restaurar el scroll del contenedor gris
            scrollContainer.style.overflow = originalOverflow;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'letter'); // PDF tamaño carta, vertical
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            let imgHeightInPdf = imgHeight * ratio; // Altura proporcional en PDF
            let position = 0;

            // Añade la imagen al PDF, página por página si es necesario
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            let heightLeft = imgHeightInPdf - pageHeight;

            while (heightLeft > 0) {
                position = position - pageHeight; // Mueve la 'ventana' de la imagen
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pageHeight;
            }

            // Guarda el PDF con un nombre descriptivo
            pdf.save(`Entrada-${entryData.correlative || 'preview'}_${new Date().toLocaleDateString('es-VE')}.pdf`);
        }).catch(err => {
            // Restaurar scroll si hay error
            scrollContainer.style.overflow = originalOverflow;
            console.error("Error al generar PDF con html2canvas:", err);
            alert("Error al generar PDF. Ver consola.");
        });
    };

    // Función que maneja el clic en "Confirmar y Guardar"
    const handleConfirmClick = async () => {
        setIsSaving(true); // Deshabilita los botones
        try {
            await onConfirm(); // Llama a la función handleSubmitEntry de EntryPage
            setIsSaving(false); // Habilita los botones nuevamente tras guardar
        } catch (error) {
            console.error("Fallo al guardar la entrada:", error);
            // Si hay un error al guardar, volvemos a habilitar los botones
            setIsSaving(false);
            // La alerta de error ya se muestra en handleSubmitEntry
        }
    };

    return (
        // Modal de pantalla completa
        <Dialog fullScreen open={open} onClose={() => { if (!isSaving) onClose(); }}> {/* Evita cerrar si está guardando */}
            {/* Barra superior con acciones */}
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    {/* Botón para cerrar el modal */}
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close" disabled={isSaving}>
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Vista Previa de Entrada
                    </Typography>

                    {/* Botones de Imprimir y Exportar: SOLO VISIBLES SI ESTÁ GUARDADO */}
                    {isSaved && (
                        <>
                            <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint} disabled={isSaving}>
                                Imprimir
                            </Button>
                            <Button color="inherit" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} disabled={isSaving}>
                                Exportar a PDF
                            </Button>
                        </>
                    )}

                    {/* Botón para confirmar y guardar: SOLO VISIBLE SI NO ESTÁ GUARDADO */}
                    {!isSaved && (
                        <Button
                            color="inherit"
                            onClick={handleConfirmClick}
                            variant="outlined"
                            disabled={isSaving} // Deshabilitado mientras guarda
                        >
                            {isSaving ? 'Guardando...' : 'Confirmar y Guardar'}
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* --- ESTILOS PARA IMPRESIÓN --- */}
            {/* Definen @page y fuerzan altura 100% SÓLO al imprimir */}
            <style>
                {`
                    @page {
                        size: letter portrait;
                        margin: 10mm !important; /* Margen de impresión */
                    }

                    @media print {
                        html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100vh !important; overflow: hidden !important; background-color: #fff !important;}
                        body * { visibility: hidden; }
                        /* Selecciona el div contenedor y su contenido */
                        #document-to-print-entry, #document-to-print-entry * { visibility: visible; }
                        #document-to-print-entry {
                            position: absolute !important; left: 0; top: 0; width: 100% !important; height: 100% !important; /* Ocupa toda la hoja */
                            margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important;
                            display: flex !important; flex-direction: column !important; background-color: #fff !important;
                        }
                        /* Asegura que el Paper interno también use toda la altura disponible en la hoja */
                        #document-to-print-entry > .MuiPaper-root {
                            max-width: none !important; width: 100% !important; height: 100% !important; /* Altura 100% */
                            box-shadow: none !important; border: none !important; margin: 0 !important;
                            padding: 10mm !important; /* Padding/margen interno */
                            display: flex !important; flex-direction: column !important; min-height: auto !important;
                            box-sizing: border-box !important; background-color: #fff !important; color: #000 !important;
                        }
                        /* Asegura texto negro en tablas también */
                        #document-to-print-entry .MuiTableCell-root {
                            color: #000 !important;
                        }
                        .MuiAppBar-root { display: none !important; } /* Oculta AppBar */
                        .print-background-container { background-color: transparent !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
                    }
                `}
            </style>
            {/* --- FIN ESTILOS PARA IMPRESIÓN --- */}

            {/* --- CONTENEDOR GRIS CON SCROLL --- */}
            {/* Controla scroll vertical/horizontal en PANTALLA */}
            <Box className="print-background-container" sx={{
                p: 3, // Padding alrededor del documento blanco en pantalla
                backgroundColor: '#e0e0e0', // Fondo gris
                minHeight: 'calc(100vh - 80px)', // Altura ajustada (viewport menos AppBar)
                overflow: 'auto', // Scroll automático
                display: 'flex', // Necesario para centrar
                justifyContent: 'center', // Centra horizontalmente
                alignItems: 'flex-start' // Alinea el documento arriba si hay scroll vertical
            }}>
                {/* Div imprimible (con ID único) */}
                <div id="document-to-print-entry">
                    {/* Renderiza el componente del documento pasándole los datos y la ref */}
                    <EntryDocument ref={documentRef} entryData={entryData} />
                </div>
            </Box>
            {/* --- FIN CONTENEDOR GRIS --- */}
        </Dialog>
    );
};

export default EntryPreviewModal;