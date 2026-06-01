const HeaderBox = ({ type= "title", title, subtext, user}: HeaderBoxProps) => {
  /* Note HeaderBoxProps comes from the index.d.ts file we created beforehand,  */
  return (
    <div className="header-box">
      <h1 className="header-box-title">
        {title}
        {type === 'greeting' && ( 
          <span className="text-bankGradient">&nbsp;{user}</span>
        )}
      </h1>
      <p className="header-box-subtext">{subtext}</p>
    </div>
  )
}

export default HeaderBox
