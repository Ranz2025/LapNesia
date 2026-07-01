<?php

namespace App\Services;

use App\Models\InspectionReport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InspectionPdfService
{
    public function generate(InspectionReport $report): string
    {
        $report->load(['job.product.brand', 'job.product.category', 'technician']);

        $product    = $report->job->product;
        $technician = $report->technician;

        $components = [
            'Baterai'       => $report->battery_status,
            'Layar'         => $report->screen_status,
            'Keyboard'      => $report->keyboard_status,
            'Touchpad'      => $report->touchpad_status,
            'Port I/O'      => $report->port_status,
            'Storage'       => $report->storage_status,
            'RAM'           => $report->ram_status,
            'CPU'           => $report->cpu_status,
            'Kondisi Fisik' => $report->physical_status,
        ];

        $filename = 'inspections/' . $report->id . '.pdf';

        $pdf = Pdf::loadView('pdf.inspection_report', compact(
            'report',
            'product',
            'technician',
            'components'
        ))
        ->setPaper('a4', 'portrait')
        ->setOption('isHtml5ParserEnabled', true)
        ->setOption('isRemoteEnabled', false)
        ->setOption('defaultFont', 'sans-serif');

        $pdfContent = $pdf->output();

        Storage::disk('public')->put($filename, $pdfContent);

        $report->update(['pdf_url' => $filename]);

        return $filename;
    }
}
