import React from 'react';

function Search(){
    return(
        <>
        {/* <h1>The search works</h1> */}
        
    
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
            <input type="text" placeholder="Search..." style={{ marginRight: '10px', padding: '5px', border: '1px solid black' }} />
            <button style={{ padding: '5px 10px', border: '1px solid black', backgroundColor: 'lightgray' }}>Search</button>
        </div>
        
        
        </>
    );
}

export default Search;