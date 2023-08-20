import typesense

client = typesense.Client({
  'nodes': [{
    'host': '192.168.58.9', 
    'port': '8108',      
    'protocol': 'http'   
  }],
  'api_key': 'xyz',
  'connection_timeout_seconds': 2
})

books_schema = {
  'name': 'books',
  'fields': [
    {'name': 'title', 'type': 'string' },
    {'name': 'authors', 'type': 'string[]', 'facet': True },

    {'name': 'publication_year', 'type': 'int32', 'facet': True },
    {'name': 'ratings_count', 'type': 'int32' },
    {'name': 'average_rating', 'type': 'float' }
  ],
  'default_sorting_field': 'ratings_count'
}

client.collections.create(books_schema)

with open('./tmp/books.jsonl') as jsonl_file:
  client.collections['books'].documents.import_(jsonl_file.read().encode('utf-8'))

