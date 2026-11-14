import { PDFDownloadLink } from '@react-pdf/renderer'
import RentalAgreementPDF from './RentalAgreementPDF'

export default function RentalAgreementDownload() {
  return (
    <PDFDownloadLink
      document={<RentalAgreementPDF />}
      fileName="Договор_аренды_ВозьмиМеня.pdf"
      className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
    >
      {({ loading }) => (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {loading ? 'Подготовка PDF...' : 'Скачать договор (PDF)'}
        </>
      )}
    </PDFDownloadLink>
  )
}
