export default function Button(props) {
    return `
    <button 
      id="${props.id}" 
      class="button"
      ${props.dataPage ? `data-page="${props.dataPage}"` : ''}
      ${props.type ? `type="${props.type}"` : 'type="button"'}
    >
      ${props.text || ''}
    </button>
  `;
}
