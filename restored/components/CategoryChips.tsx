type Props = { value: string; onChange: (v:string)=>void };
const cats = ['All','Bar','Restaurant','Cafe','Park','Store'];
export default function CategoryChips({value,onChange}:Props){
  return (
    <div className="container">
      <div className="chips">
        {cats.map(c => (
          <div
            key={c}
            className={`chip ${value===c ? 'chip-active' : ''}`}
            onClick={()=>onChange(c)}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
