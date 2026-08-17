/** Alex Pavlenko static gallery interactions — no dependencies. */
(function(){'use strict';
  var root=document.documentElement,storageKey='alex-pavlenko-theme';
  function storedTheme(){try{var v=localStorage.getItem(storageKey);return v==='light'||v==='dark'?v:null}catch(e){return null}}
  function systemTheme(){return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
  function activeTheme(){return storedTheme()||systemTheme()}
  function applyTheme(theme,persist){root.setAttribute('data-theme',theme);if(persist){try{localStorage.setItem(storageKey,theme)}catch(e){}}updateThemeButton(theme)}
  function updateThemeButton(theme){var b=document.querySelector('.ap-theme-toggle');if(!b)return;var next=theme==='dark'?'light':'dark';b.textContent=theme==='dark'?'☀':'☾';b.setAttribute('aria-label','Switch to '+next+' theme');b.setAttribute('title','Switch to '+next+' theme')}
  applyTheme(activeTheme(),false);

  function ready(){
    var nav=document.querySelector('.main-navigation'),header=document.querySelector('.site-header');
    if(nav&&header){
      var controls=document.createElement('div');controls.className='ap-controls';
      var theme=document.createElement('button');theme.type='button';theme.className='ap-theme-toggle';theme.setAttribute('aria-label','Toggle color theme');controls.appendChild(theme);
      var mobile=document.createElement('button');mobile.type='button';mobile.className='ap-mobile-toggle';mobile.innerHTML='<span aria-hidden="true">☰</span>';mobile.setAttribute('aria-label','Open navigation');mobile.setAttribute('aria-expanded','false');controls.appendChild(mobile);
      nav.appendChild(controls);updateThemeButton(activeTheme());
      theme.addEventListener('click',function(){applyTheme((root.getAttribute('data-theme')||activeTheme())==='dark'?'light':'dark',true)});
      mobile.addEventListener('click',function(){var open=nav.classList.toggle('ap-open');mobile.setAttribute('aria-expanded',String(open));mobile.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobile.innerHTML='<span aria-hidden="true">'+(open?'×':'☰')+'</span>'});
      nav.addEventListener('click',function(e){if(e.target.closest('a')&&window.matchMedia('(max-width: 1060px)').matches){nav.classList.remove('ap-open');mobile.setAttribute('aria-expanded','false');mobile.innerHTML='<span aria-hidden="true">☰</span>'}});
      document.addEventListener('click',function(e){if(nav.classList.contains('ap-open')&&!nav.contains(e.target)){nav.classList.remove('ap-open');mobile.setAttribute('aria-expanded','false');mobile.innerHTML='<span aria-hidden="true">☰</span>'}});
    }
    if(window.matchMedia){var mq=window.matchMedia('(prefers-color-scheme: dark)');var onChange=function(){if(!storedTheme())applyTheme(systemTheme(),false)};if(mq.addEventListener)mq.addEventListener('change',onChange);else if(mq.addListener)mq.addListener(onChange)}

    document.querySelectorAll('.entry-content img').forEach(function(img){if(!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async'});
    setupLightbox();
  }

  function setupLightbox(){
    var links=Array.prototype.slice.call(document.querySelectorAll('.wp-block-gallery .blocks-gallery-item a'))
      .filter(function(a){return a.querySelector('img')&&a.getAttribute('href')});
    if(!links.length)return;
    var box=document.createElement('div');box.className='ap-lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Artwork viewer');box.setAttribute('aria-hidden','true');
    box.innerHTML='<div class="ap-lightbox__stage"><button type="button" class="ap-lightbox__close" aria-label="Close artwork viewer">×</button><button type="button" class="ap-lightbox__prev" aria-label="Previous artwork">‹</button><img class="ap-lightbox__img" alt=""><button type="button" class="ap-lightbox__next" aria-label="Next artwork">›</button><div class="ap-lightbox__caption" aria-live="polite"></div></div>';
    document.body.appendChild(box);
    var image=box.querySelector('.ap-lightbox__img'),caption=box.querySelector('.ap-lightbox__caption'),close=box.querySelector('.ap-lightbox__close'),prev=box.querySelector('.ap-lightbox__prev'),next=box.querySelector('.ap-lightbox__next');
    var current=0,lastFocus=null;
    function sourceFor(a){var img=a.querySelector('img');return (img.currentSrc||img.getAttribute('src')||img.src||'').replace(/^http:\/\//i,'https://')}
    function labelFor(a){var img=a.querySelector('img'),fig=a.closest('figure'),fc=fig&&fig.querySelector('figcaption');return (fc&&fc.textContent.trim())||img.alt||decodeURIComponent((sourceFor(a).split('/').pop()||'Artwork').replace(/[-_]+/g,' ').replace(/\.(jpe?g|png|gif|webp)$/i,''))}
    function render(){var a=links[current];image.src=sourceFor(a);image.alt=labelFor(a);caption.textContent=labelFor(a);prev.hidden=links.length<2;next.hidden=links.length<2}
    function open(i,focus){current=i;lastFocus=focus;render();box.setAttribute('aria-hidden','false');document.body.classList.add('ap-lightbox-open');close.focus()}
    function shut(){box.setAttribute('aria-hidden','true');document.body.classList.remove('ap-lightbox-open');image.removeAttribute('src');if(lastFocus&&lastFocus.focus)lastFocus.focus()}
    function step(delta){current=(current+delta+links.length)%links.length;render()}
    links.forEach(function(a,i){a.removeAttribute('target');a.addEventListener('click',function(e){if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();open(i,a)})});
    close.addEventListener('click',shut);prev.addEventListener('click',function(){step(-1)});next.addEventListener('click',function(){step(1)});box.addEventListener('click',function(e){if(e.target===box||e.target.classList.contains('ap-lightbox__stage'))shut()});
    document.addEventListener('keydown',function(e){if(box.getAttribute('aria-hidden')==='true')return;if(e.key==='Escape')shut();else if(e.key==='ArrowLeft')step(-1);else if(e.key==='ArrowRight')step(1)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
