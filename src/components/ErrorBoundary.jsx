import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('The Family Auto UI error:', error, info); }
  render() {
    if (this.state.failed) return <main className="fatal-error"><span>THE FAMILY AUTO</span><h1>Что-то пошло не так</h1><p>Обновите страницу. Если ошибка повторится, проверьте API сервера.</p><button onClick={() => window.location.reload()}>Обновить страницу</button></main>;
    return this.props.children;
  }
}
