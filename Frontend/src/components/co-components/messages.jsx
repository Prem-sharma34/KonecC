import React from 'react';

function Messages() {
  return (
    <div>
      {/* <h1>Hey</h1> */}
      <div className="inbox">
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Prem</div>
          </div>
          <div className="inbox-item-message">Hey, how are you?</div>
        </div>
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Rohit</div>
          </div>
          <div className="inbox-item-message">What's up?</div>
        </div>
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Surbhi</div>
          </div>
          <div className="inbox-item-message">Long time no see!</div>
        </div>
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Shaurya</div>
          </div>
          <div className="inbox-item-message">Call me back.</div>
        </div>
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Suryansh</div>
          </div>
          <div className="inbox-item-message">I'll be there soon.</div>
        </div>
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Viraj</div>
          </div>
          <div className="inbox-item-message">See you later.</div>
        </div>
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Swayam</div>
          </div>
          <div className="inbox-item-message">Don't forget.</div>
        </div>
        <div className="inbox-item">
          <div className="inbox-item-header">
            <div className="inbox-item-name">Anuj</div>
          </div>
          <div className="inbox-item-message">Got it.</div>
        </div>
      </div>


    </div>
  );
}

export default Messages;
