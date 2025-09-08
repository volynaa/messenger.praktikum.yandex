export default `<input 
    id="{{id}}" 
    type="{{type}}" 
    placeholder="{{placeholder}}" 
    value="{{value}}" 
    class="input"
    name="{{id}}"
    minLen="{{minLen}}"
    maxLen="{{maxLen}}"
    {{#if pattern}}pattern="{{pattern}}"{{/if}}
>`