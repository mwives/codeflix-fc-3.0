import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  ElasticsearchContainer,
  StartedElasticsearchContainer,
} from '@testcontainers/elasticsearch';
import crypto from 'crypto';
import debug from 'debug';
import { esMapping } from '../db/elastic-search/es-mapping';

global.fail = (message) => {
  throw new Error(message);
};

export async function tryStartContainer<T>(fn: () => Promise<T>): Promise<T> {
  do {
    try {
      return await fn();
    } catch (e) {
      if (!e.message.includes('port is already allocated')) {
        throw e;
      }
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);
}

const esDebug = debug('eshelper');

type SetupElasticSearchHelper = {
  deleteIndex: boolean;
};

export function setupElasticsearch(
  options: SetupElasticSearchHelper = { deleteIndex: true },
) {
  let _esClient: ElasticsearchService;
  let _startedContainer: StartedElasticsearchContainer;
  let _indexName: string;

  beforeAll(async () => {
    _startedContainer = await tryStartContainer(async () => {
      return new ElasticsearchContainer('elasticsearch:7.17.7')
        .withReuse()
        .withTmpFs({
          '/usr/share/elasticsearch/data': 'rw',
        })
        .withExposedPorts({
          container: 9200,
          host: 9300,
        })
        .start();
    });
  }, 120000);

  beforeEach(async () => {
    _indexName = 'test_es_' + crypto.randomInt(0, 1000000);
    esDebug('Creating index %s', _indexName);
    _esClient = new ElasticsearchService({
      node: _startedContainer.getHttpUrl(),
    });
    await _esClient.indices.create({
      index: _indexName,
      body: {
        mappings: esMapping,
        settings: {
          analysis: {
            analyzer: {
              ngram_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'ngram_filter', 'asciifolding'],
              },
            },
            filter: {
              ngram_filter: {
                type: 'ngram',
                min_gram: 3,
                max_gram: 4,
              },
            },
          },
        },
      },
    });
  });

  afterEach(async () => {
    if (!options.deleteIndex) {
      return;
    }
    await _esClient?.indices?.delete({ index: _indexName });
  });

  return {
    get esClient() {
      return _esClient;
    },
    get indexName() {
      return _indexName;
    },
    get container() {
      return _startedContainer;
    },
    get esUrl() {
      return _startedContainer.getHttpUrl();
    },
  };
}
