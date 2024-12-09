import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useMemo } from 'react';
import { isDefined } from 'twenty-ui';

export type GqlFieldToFieldMap = {
  [gqlField: string]: [
    fieldName: string,
    aggregateOperation: AGGREGATE_OPERATIONS,
  ];
};

export const useAggregateRecordsQuery = ({
  objectNameSingular,
  recordGqlFieldsAggregate = {},
}: {
  objectNameSingular: string;
  recordGqlFieldsAggregate: RecordGqlFieldsAggregate;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const availableAggregations = useMemo(
    () => getAvailableAggregationsFromObjectFields(objectMetadataItem.fields),
    [objectMetadataItem.fields],
  );

  const recordGqlFields: RecordGqlFields = {};
  const gqlFieldToFieldMap: GqlFieldToFieldMap = {};

  Object.entries(recordGqlFieldsAggregate).forEach(
    ([fieldName, aggregateOperations]) => {
      aggregateOperations.forEach((aggregateOperation) => {
        const fieldToQuery =
          availableAggregations[fieldName]?.[aggregateOperation];

        if (!isDefined(fieldToQuery)) {
          throw new Error(
            `Cannot query operation ${aggregateOperation} on field ${fieldName}`,
          );
        }
        gqlFieldToFieldMap[fieldToQuery] = [fieldName, aggregateOperation];

        recordGqlFields[fieldToQuery] = true;
      });
    },
  );

  const aggregateQuery = generateAggregateQuery({
    objectMetadataItem,
    recordGqlFields,
  });

  return {
    aggregateQuery,
    gqlFieldToFieldMap,
  };
};