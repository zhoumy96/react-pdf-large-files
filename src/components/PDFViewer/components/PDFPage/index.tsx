import { forwardRef } from 'react';
import { Page } from 'react-pdf';

import './index.less';

const prefixCls = 'PDFPage'
const PDFPage = forwardRef((props: {
	visible: boolean, // 是否渲染
	scale: number, // 缩放比例，默认：1
	pageIndex: number,
	width?: number,
}, ref: any) => {
	const {visible, scale, pageIndex, width} = props;
	const ppp = {
		className: prefixCls,
		ref: ref,
		'data-page-index': pageIndex
	}
	if (visible) {
		// @ts-ignore
		ppp['data-loaded'] = true;
	}
	return (
		<div
			{...ppp}
		>
			{
				visible ? (
					<Page
						renderAnnotationLayer={false}
						pageNumber={pageIndex + 1}
						scale={scale}
						className={`${prefixCls}-page`}
						// @ts-ignore
						style={{
							maxWidth: '100%',
							'& > canvas': {
								maxWidth: '100%',
								height: 'auto !important'
							}
						}}
						loading={<div className={`${prefixCls}-loading`}/>}
					/>
				) : <div className={`${prefixCls}-loading`}/>
			}
		</div>
	);
})

export default PDFPage;