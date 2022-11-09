import './App.css'
import PDFViewer from './components/PDFViewer';
import demoPDF from '../src/assets/demo.pdf';

function App() {

  return (
    <div className="App">
      <PDFViewer url={demoPDF}/>
    </div>
  )
}

export default App
