import { useTranslation } from '@hooks';
import {
  Button,
  ButtonGroup,
  Card,
  FormLayout,
  Icon,
  Select,
  Stack,
  Text,
} from '@shopify/polaris';
import { ClockMajor } from '@shopify/polaris-icons';
import { FieldDictionary } from '@shopify/react-form';
import { memo, useCallback, useMemo } from 'react';

export default memo(
  ({
    fields,
  }: {
    fields: FieldDictionary<Pick<Product, 'buffertime' | 'duration'>>;
  }) => {
    const { t } = useTranslation('collections', {
      keyPrefix: 'product.options',
    });

    const options = useMemo(
      () => [
        { label: '0 min', value: '0' },
        { label: '5 min', value: '5' },
        { label: '10 min', value: '10' },
        { label: '15 min', value: '15' },
        { label: '20 min', value: '20' },
        { label: '25 min', value: '25' },
        { label: '30 min', value: '30' },
      ],
      []
    );

    const selectLabel = useMemo(
      () => (
        <Stack spacing="tight">
          <Stack.Item>
            <Icon source={ClockMajor} />
          </Stack.Item>
          <Stack.Item>{t('buffertime.label')}</Stack.Item>
        </Stack>
      ),
      []
    );

    const onChangeSelect = useCallback(
      (value: string) => fields.buffertime.onChange(parseInt(value)),
      [fields.buffertime.onChange]
    );

    const onChange = useCallback(
      (value: number) => () => fields.duration.onChange(value),
      [fields.duration.onChange]
    );

    return (
      <>
        <Card sectioned>
          <FormLayout>
            <Text variant="headingSm" as="h6">
              {t('duration.label')}
            </Text>
            <ButtonGroup segmented>
              <Button
                pressed={fields.duration.value === 30}
                onClick={onChange(30)}>
                30 min
              </Button>
              <Button
                pressed={fields.duration.value === 45}
                onClick={onChange(45)}>
                45 min
              </Button>
              <Button
                pressed={fields.duration.value === 60}
                onClick={onChange(60)}>
                60 min
              </Button>
            </ButtonGroup>
          </FormLayout>
        </Card>
        <Card sectioned>
          <FormLayout>
            <Text variant="headingXs" as="h6">
              {t('duration.help')}
            </Text>
            <Select
              label={selectLabel}
              options={options}
              helpText={t('buffertime.help')}
              value={fields.buffertime.value?.toString()}
              onChange={onChangeSelect}
            />
          </FormLayout>
        </Card>
      </>
    );
  }
);
