function cleanHTML(obj) {
    if (typeof obj === 'string') {
      return stripHTML(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(cleanHTML);
    } else if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const key in obj) {
        result[key] = cleanHTML(obj[key]);
      }
      return result;
    }
    return obj;
  }

  function stripHTML(html) {
    return html.replace(/<[^>]*>/g, '');
  }
  