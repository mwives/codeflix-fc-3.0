import { SortDirection } from '@core/shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory.repository';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import {
  VideoFilter,
  IVideoRepository,
} from '@core/video/domain/repository/video.repository';

export class VideoInMemoryRepository
  extends InMemorySearchableRepository<Video, VideoId, VideoFilter>
  implements IVideoRepository
{
  sortableFields: string[] = ['title', 'createdAt'];

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }

  protected async applyFilter(
    items: Video[],
    filter: VideoFilter | null,
  ): Promise<Video[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const containsTitle =
        filter.title &&
        i.title.toLowerCase().includes(filter.title.toLowerCase());
      const containsCategoriesId =
        filter.categoryIds &&
        filter.categoryIds.some((c) => i.categoryIds.has(c.id));
      const containsGenresId =
        filter.genreIds && filter.genreIds.some((c) => i.genreIds.has(c.id));
      const containsCastMembersId =
        filter.castMemberIds &&
        filter.castMemberIds.some((c) => i.castMemberIds.has(c.id));

      const filterMap = [
        [filter.title, containsTitle],
        [filter.categoryIds, containsCategoriesId],
        [filter.genreIds, containsGenresId],
        [filter.castMemberIds, containsCastMembersId],
      ].filter((i) => i[0]);

      return filterMap.every((i) => i[1]);
    });
  }

  protected applySort(
    items: Video[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Video[] {
    return !sort
      ? super.applySort(items, 'createdAt', 'desc')
      : super.applySort(items, sort, sortDir);
  }
}
