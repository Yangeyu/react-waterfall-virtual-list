import './App.css'
import { VirtualWaterFall } from '../../../src/index.tsx'
import { dataSource } from './index.data.ts'

function App() {

  return (
    <div >
      <VirtualWaterFall
        style={{ width: '60vw', height: '80vh'}}
        list={dataSource}
        calcCardHeight={(_cardWidth, imageHeight, _item) => {
          return Promise.resolve(imageHeight)
        }}
        renderItem={({ item }) => {
          return (
            <div style={{ width: '100%' }}>
              <div style={{ 
                width: item?.style?.width,
                height: item?.style?.imageHeight,
                background: item.color
              }}></div>
            </div>
          )
        }}
      />
    </div>
  )
}

export default App
