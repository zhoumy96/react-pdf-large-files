import { createRef, useEffect, useMemo, useState } from 'react';
import { Document, pdfjs } from 'react-pdf';
import PDFPage from './components/PDFPage';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import pdfIcon from '../../assets/pdf-icon.svg'
import './index.less';

const prefixCls = 'PDFViewer'
const PDFViewer = (props: {
	url: string; // PDFUrl
}) => {
	const {url = ''} = props;
	const [numPages, setNumPages] = useState<number>(0); // 总页数
	// const [currentPage, setCurrentPage] = useState<number>(1); // 当前页数
	const [scale, setScale] = useState<number>(1);
	const [title, setTitle] = useState<string>(''); // 文件title

	const [size, setSize] = useState<{ width: number, height: number }>({width: 0, height: 0}); // PDFSize
	const [observer, setObserver] = useState<any>(null); // 观察者
	const [visibilities, setVisibilities] = useState<boolean[]>([]); // 是否渲染canvas
	const pageRefs = useMemo(() => {
		return Array.from(new Array(numPages), () => createRef());
	}, [numPages]);
	const canvasDom = document.querySelector('canvas'); // 获取默认的宽高

	// 观察目标
	useEffect(() => {
		const titleArr = url.split('/');
		setTitle(titleArr[titleArr.length - 1]);

		const observerOptions = {
			root: document.getElementsByClassName('PDFViewer-viewer')[0],
			rootMargin: `${document.body.clientHeight * 2}px 0px`,
			threshold: 0.0
		};
		const observerCallback = (entries: any[], io: any) => {
			const intersects = entries.reduce((acc, entry) => {
				const pageIndex = parseInt(entry.target.getAttribute('data-page-index'));
				const isIntersecting = entry.isIntersecting;
				return {
					...acc,
					[pageIndex]: isIntersecting
				};
			}, {});
			setVisibilities((prev: any[]) => prev.map((visible, index) => {
				if (intersects.hasOwnProperty(index)) {
					return intersects[index];
				}
				return visible;
			}));
			// setScale(1);
		};
		const io = new IntersectionObserver(observerCallback, observerOptions);
		setObserver(io);

		return () => {
			io.disconnect();
		};
	}, [])

	// 建立观察
	useEffect(() => {
		if (observer) {
			const {width} = size;
			pageRefs.forEach((pageRef: any) => {
				observer.observe(pageRef.current);
				if (!width) {
					getSize();
				}
			});

		}
	}, [observer, pageRefs])

	// 设置默认宽高
	useEffect(() => {
		if (!size.width) {
			getSize()
		}
	}, [canvasDom])

	// 设置PDF宽高
	useEffect(() => {
		const {width, height} = size;
		const allPDFPageDom = document.getElementsByClassName('PDFPage');
		for (let i = 0; i < allPDFPageDom.length; i++) {
			const PDFPageDom = allPDFPageDom[i] as HTMLElement;
			PDFPageDom.style.width = `${width}px`;
			PDFPageDom.style.height = `${height}px`;
		}
	}, [size.width])

	// 缩放后重新获取宽高
	useEffect(() => {
		getSize()
	}, [scale])

	// 获取canvas宽高
	const getSize = () => {
		const canvasDom = document.querySelector('canvas');
		const width = canvasDom?.clientWidth || 0;
		const height = canvasDom?.clientHeight || 0;
		setSize({
			width, height
		})
	}
	// react-pdf
	const onLoadSuccess = ({numPages}: any) => {
		setNumPages(Number(numPages));
		setVisibilities(Array.from(new Array(numPages), () => false));
	};
	// PDFViewer-Tool
	// 放大 maxValue:3
	const pageZoomIn = () => {
		if (scale >= 3) {
			return
		}
		setScale(scale + 0.1);
	}
	// 缩小 minValue:0.5
	const pageZoomOut = () => {
		if (scale >= 0.6) {
			setScale((s) => s - 0.1);
		}
	}

	return (
		<div className={prefixCls}>
			<div className={`${prefixCls}-container`}>
				{/* 顶部工具栏 */}
				<div className={`${prefixCls}-headerToolbar`}>
					<div className={`${prefixCls}-headerToolbar-container`}>
						<div className={`${prefixCls}-headerToolbar-container-title`}>
							<img src={pdfIcon} alt=""/>
							<span>{title}</span>
						</div>
					</div>
				</div>
				{/* 底部工具栏 */}
				<div className={`${prefixCls}-toolbar`}>
					{/* 页码 */}
					{/*<input className={`${prefixCls}-toolbar-pageNumber`} type="number" value={currentPage} min={1}*/}
					{/*       max={numPages}/>*/}
					{/*<span className={`${prefixCls}-toolbar-numPages`}>/ {numPages}</span>*/}
					<span className={`${prefixCls}-toolbar-allNumber`}>总页数：</span>
					<span className={`${prefixCls}-toolbar-numPages`}>{numPages}</span>
					{/* 分割线 */}
					<div className={`${prefixCls}-toolbar-deliver`}/>
					{/* 缩放工具栏 */}
					<div className={`${prefixCls}-toolbar-button`}>
						<button className={`${prefixCls}-toolbar-button-zoomOut`} onClick={pageZoomOut}/>
						<span>{Number(scale * 100).toFixed(0)}%</span>
						<button className={`${prefixCls}-toolbar-button-zoomIn`} onClick={pageZoomIn}/>
					</div>
				</div>
				{/* PDFViewer */}
				<div className={`${prefixCls}-viewer`}>
					<Document
						className={`${prefixCls}-viewer-Document`}
						file={url}
						onLoadSuccess={onLoadSuccess}
					>
						{visibilities.map((visible, index) => (
							<PDFPage
								ref={pageRefs[index]}
								key={`page_${index}`}
								pageIndex={index}
								visible={visible}
								scale={scale}
							/>
						))}
					</Document>
				</div>
			</div>
		</div>
	)
}
export default PDFViewer;