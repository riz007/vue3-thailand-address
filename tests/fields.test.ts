import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import ThaiAddressFields from "../src/components/ThaiAddressFields.vue";
import type { ThaiAddressRow } from "../src/types";

const baseData: ThaiAddressRow[] = [
  {
    subdistrict: "Alpha",
    district: "District A",
    province: "Province A",
    zipcode: "10110",
  },
  {
    subdistrict: "Beta",
    district: "District B",
    province: "Province B",
    zipcode: "10220",
  },
];

const createWrapper = (data: ThaiAddressRow[] = baseData) => {
  const Parent = defineComponent({
    components: { ThaiAddressFields },
    setup() {
      const model = ref<ThaiAddressRow>({
        subdistrict: "",
        district: "",
        province: "",
        zipcode: "",
      });
      return { model, data };
    },
    template:
      '<ThaiAddressFields v-model="model" :data="data" :min-chars="1" :debounce-ms="0" />',
  });

  return mount(Parent);
};

describe("ThaiAddressFields", () => {
  it("renders four inputs with default labels", () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll("input.ta-input");
    expect(inputs).toHaveLength(4);

    const labels = wrapper.findAll(".ta-label").map((node) => node.text());
    expect(labels).toEqual(["Subdistrict", "District", "Province", "Zipcode"]);
  });

  it("fills all fields when a suggestion is selected", async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll("input.ta-input");

    await inputs[0].setValue("Alpha");
    await nextTick();

    const firstField = wrapper.findAll(".ta-field")[0];
    const options = firstField.findAll(".ta-option");
    expect(options).toHaveLength(1);

    await options[0].trigger("mousedown");
    await nextTick();

    const vm = wrapper.vm as unknown as { model: ThaiAddressRow };
    expect(vm.model).toEqual(baseData[0]);

    const values = inputs.map((input) => input.element.value);
    expect(values).toEqual([
      baseData[0].subdistrict,
      baseData[0].district,
      baseData[0].province,
      baseData[0].zipcode,
    ]);
  });

  it("filters suggestions by the active field", async () => {
    const data: ThaiAddressRow[] = [
      {
        subdistrict: "Foo",
        district: "Bar",
        province: "Bangkok",
        zipcode: "10000",
      },
      {
        subdistrict: "Baz",
        district: "Foo",
        province: "Chiang Mai",
        zipcode: "50000",
      },
    ];

    const wrapper = createWrapper(data);
    const fieldContainers = wrapper.findAll(".ta-field");
    const districtField = fieldContainers[1];
    const districtInput = districtField.find("input.ta-input");

    await districtInput.setValue("Foo");
    await nextTick();

    const options = districtField.findAll(".ta-option");
    expect(options).toHaveLength(1);
    expect(options[0].text()).toContain("Foo");
  });
});
