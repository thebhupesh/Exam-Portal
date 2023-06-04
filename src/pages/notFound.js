export default function NotFound() {
    return (<>
        <div style={{margin: "auto", textAlign: "center"}}>
            <img src="https://i.imgur.com/qIufhof.png" alt="not-found" style={{width: "500px"}}/>
            <div id="info">
                <h1>Error: 404</h1>
                <h2>This page does not exist</h2>
            </div>
            <a className="nav-link active" href="/home"><h4>Go to Home &#10132;</h4></a>
        </div>
    </>);
}