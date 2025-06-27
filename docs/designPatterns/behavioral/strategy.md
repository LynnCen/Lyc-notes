# 策略模式 (Strategy Pattern)

> [!NOTE]
> **策略模式** (Strategy Pattern) 定义了一系列算法，将它们各自封装，并使之可以相互替换。该模式让算法的变化独立于使用算法的客户。

## 📖 模式定义

**策略模式**是一种行为型设计模式，它定义了一系列算法，将每个算法封装起来，并使它们可以相互替换。策略模式让算法的变化独立于使用算法的客户端。

### 核心要素
- **Context (上下文)**：持有一个策略对象的引用，并将客户端的请求委托给该策略对象进行处理。
- **Strategy (策略接口)**：定义了所有具体策略类所需的公共接口，是上下文与具体策略之间的通信桥梁。
- **ConcreteStrategy (具体策略)**：实现了策略接口，封装了具体的算法或行为。

## 🎯 使用场景

### 适用情况
- **多种算法选择**：一个系统需要动态地在几种算法中选择一种。
- **避免多重条件判断**：当业务逻辑中存在大量 `if-else` 或 `switch-case` 语句时，可使用策略模式简化结构。
- **算法独立变化**：希望在不影响客户端的情况下独立改变、复用或扩展算法。

### 不适用情况
- **算法固定**：当算法集合很少改变或非常稳定时，没有必要使用策略模式。
- **逻辑简单**：对于仅有少量条件分支的简单逻辑，直接使用条件语句可能比引入策略模式更直观。

## 💡 实现方式

### TypeScript 实现

```typescript
// 策略接口
interface PaymentStrategy {
    pay(amount: number): void;
}

// 具体策略：信用卡支付
class CreditCardPayment implements PaymentStrategy {
    constructor(
        private cardNumber: string,
        private name: string
    ) {}

    pay(amount: number): void {
        console.log(`使用信用卡 ${this.cardNumber} 支付 ¥${amount}`);
        console.log(`持卡人：${this.name}`);
    }
}

// 具体策略：支付宝支付
class AlipayPayment implements PaymentStrategy {
    constructor(private account: string) {}

    pay(amount: number): void {
        console.log(`使用支付宝账户 ${this.account} 支付 ¥${amount}`);
    }
}

// 具体策略：微信支付
class WechatPayment implements PaymentStrategy {
    constructor(private phone: string) {}

    pay(amount: number): void {
        console.log(`使用微信(${this.phone}) 支付 ¥${amount}`);
    }
}

// 上下文类
class ShoppingCart {
    private items: { name: string; price: number }[] = [];
    private paymentStrategy: PaymentStrategy | null = null;

    addItem(name: string, price: number): void {
        this.items.push({ name, price });
    }

    setPaymentStrategy(strategy: PaymentStrategy): void {
        this.paymentStrategy = strategy;
    }

    getTotalAmount(): number {
        return this.items.reduce((total, item) => total + item.price, 0);
    }

    checkout(): void {
        if (!this.paymentStrategy) {
            throw new Error('请选择支付方式');
        }

        const total = this.getTotalAmount();
        console.log('=== 购物车结算 ===');
        this.items.forEach(item => {
            console.log(`${item.name}: ¥${item.price}`);
        });
        console.log(`总计: ¥${total}`);
        console.log('---');
        
        this.paymentStrategy.pay(total);
    }
}

// 使用示例
const cart = new ShoppingCart();
cart.addItem('iPhone 15', 6999);
cart.addItem('AirPods', 1299);

// 使用不同的支付策略
const creditCard = new CreditCardPayment('**** **** **** 1234', '张三');
cart.setPaymentStrategy(creditCard);
cart.checkout();

console.log('\n--- 切换支付方式 ---\n');

const alipay = new AlipayPayment('zhangsan@example.com');
cart.setPaymentStrategy(alipay);
cart.checkout();
```

### 更复杂的策略模式示例

```typescript
// 排序策略接口
interface SortStrategy<T> {
    sort(data: T[]): T[];
}

// 冒泡排序策略
class BubbleSortStrategy<T> implements SortStrategy<T> {
    sort(data: T[]): T[] {
        const result = [...data];
        const n = result.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (result[j] > result[j + 1]) {
                    [result[j], result[j + 1]] = [result[j + 1], result[j]];
                }
            }
        }
        
        console.log('使用冒泡排序');
        return result;
    }
}

// 快速排序策略
class QuickSortStrategy<T> implements SortStrategy<T> {
    sort(data: T[]): T[] {
        if (data.length <= 1) return [...data];
        
        const pivot = data[Math.floor(data.length / 2)];
        const left = data.filter(x => x < pivot);
        const middle = data.filter(x => x === pivot);
        const right = data.filter(x => x > pivot);
        
        // 注意：为简化示例，此处的快速排序实现并非最优，在递归中也打印了日志
        console.log('使用快速排序');
        return [
            ...this.sort(left),
            ...middle,
            ...this.sort(right)
        ];
    }
}

// 原生排序策略
class NativeSortStrategy<T> implements SortStrategy<T> {
    sort(data: T[]): T[] {
        console.log('使用原生排序');
        return [...data].sort();
    }
}

// 排序上下文
class Sorter<T> {
    private strategy: SortStrategy<T>;

    constructor(strategy: SortStrategy<T>) {
        this.strategy = strategy;
    }

    setStrategy(strategy: SortStrategy<T>): void {
        this.strategy = strategy;
    }

    sort(data: T[]): T[] {
        return this.strategy.sort(data);
    }
}

// 使用示例
const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorter = new Sorter(new BubbleSortStrategy<number>());

console.log('原始数据:', numbers);
console.log('排序结果:', sorter.sort(numbers));

// 切换策略
sorter.setStrategy(new QuickSortStrategy<number>());
console.log('排序结果:', sorter.sort(numbers));

sorter.setStrategy(new NativeSortStrategy<number>());
console.log('排序结果:', sorter.sort(numbers));
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **算法动态切换**：通过封装算法族，使得算法可以在运行时根据需求动态切换，提高了系统的灵活性。
2. **简化条件逻辑**：消除了大量的 `if-else` 或 `switch-case` 语句，使代码结构更清晰。
3. **高扩展性**：新增策略只需添加新的具体策略类，无需修改现有代码，符合开闭原则。
4. **代码复用**：每个算法被封装在独立的策略类中，便于在不同上下文中复用。

### ❌ 缺点
1. **类数量膨胀**：每个具体策略都是一个独立的类，可能导致系统中类的数量增多。
2. **客户端认知成本**：客户端需要了解并区分所有策略的差异，以便在合适的时机选择合适的策略。
3. **对象创建开销**：上下文与策略对象之间的交互增加了对象的创建和通信开销。

## 🌟 实际应用案例

### 应用场景示例

```typescript
// 价格计算策略（电商折扣场景）
interface DiscountStrategy {
    calculateDiscount(originalPrice: number): number;
}

// 普通用户折扣
class RegularCustomerDiscount implements DiscountStrategy {
    calculateDiscount(originalPrice: number): number {
        return originalPrice; // 无折扣
    }
}

// VIP用户折扣
class VIPCustomerDiscount implements DiscountStrategy {
    calculateDiscount(originalPrice: number): number {
        return originalPrice * 0.9; // 9折
    }
}

// 黄金用户折扣
class GoldCustomerDiscount implements DiscountStrategy {
    calculateDiscount(originalPrice: number): number {
        return originalPrice * 0.8; // 8折
    }
}

// 限时促销折扣
class PromotionDiscount implements DiscountStrategy {
    constructor(private discountRate: number) {}
    
    calculateDiscount(originalPrice: number): number {
        return originalPrice * this.discountRate;
    }
}

// 价格计算器
class PriceCalculator {
    constructor(private discountStrategy: DiscountStrategy) {}

    setDiscountStrategy(strategy: DiscountStrategy): void {
        this.discountStrategy = strategy;
    }

    calculateFinalPrice(originalPrice: number): number {
        return this.discountStrategy.calculateDiscount(originalPrice);
    }
}

// 使用示例
const calculator = new PriceCalculator(new RegularCustomerDiscount());
const originalPrice = 1000;

console.log(`原价: ¥${originalPrice}`);
console.log(`普通用户价格: ¥${calculator.calculateFinalPrice(originalPrice)}`);

calculator.setDiscountStrategy(new VIPCustomerDiscount());
console.log(`VIP用户价格: ¥${calculator.calculateFinalPrice(originalPrice)}`);

calculator.setDiscountStrategy(new PromotionDiscount(0.7));
console.log(`促销价格: ¥${calculator.calculateFinalPrice(originalPrice)}`);
```

### 表单验证策略示例

```typescript
// 验证策略接口
interface ValidationStrategy {
    validate(value: string): { isValid: boolean; message: string };
}

// 邮箱验证策略
class EmailValidationStrategy implements ValidationStrategy {
    validate(value: string): { isValid: boolean; message: string } {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);
        return {
            isValid,
            message: isValid ? '' : '请输入有效的邮箱地址'
        };
    }
}

// 手机号验证策略
class PhoneValidationStrategy implements ValidationStrategy {
    validate(value: string): { isValid: boolean; message: string } {
        const phoneRegex = /^1[3-9]\d{9}$/;
        const isValid = phoneRegex.test(value);
        return {
            isValid,
            message: isValid ? '' : '请输入有效的手机号'
        };
    }
}

// 密码强度验证策略
class PasswordValidationStrategy implements ValidationStrategy {
    validate(value: string): { isValid: boolean; message: string } {
        const hasLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        
        const isValid = hasLength && hasUpper && hasLower && hasNumber;
        let message = '';
        
        if (!isValid) {
            const issues = [];
            if (!hasLength) issues.push('至少8位');
            if (!hasUpper) issues.push('包含大写字母');
            if (!hasLower) issues.push('包含小写字母');
            if (!hasNumber) issues.push('包含数字');
            message = `密码需要：${issues.join('、')}`;
        }
        
        return { isValid, message };
    }
}

// 表单字段类
class FormField {
    constructor(
        private name: string,
        private value: string,
        private validationStrategy: ValidationStrategy
    ) {}

    setValue(value: string): void {
        this.value = value;
    }

    setValidationStrategy(strategy: ValidationStrategy): void {
        this.validationStrategy = strategy;
    }

    validate(): { isValid: boolean; message: string } {
        return this.validationStrategy.validate(this.value);
    }

    getName(): string {
        return this.name;
    }
}

// 使用示例
const emailField = new FormField('email', 'test@example.com', new EmailValidationStrategy());
const phoneField = new FormField('phone', '13800138000', new PhoneValidationStrategy());
const passwordField = new FormField('password', 'weakpass', new PasswordValidationStrategy());

console.log('表单验证结果:');
[emailField, phoneField, passwordField].forEach(field => {
    const result = field.validate();
    console.log(`${field.getName()}: ${result.isValid ? '✓' : '✗'} ${result.message}`);
});
```

## 🔄 相关模式

- **状态模式 (State Pattern)**：与策略模式结构相似，但意图不同。策略模式侧重于让客户端选择并替换算法，而状态模式侧重于通过状态的变迁自动改变对象的行为。
- **模板方法模式 (Template Method Pattern)**：模板方法模式在父类中定义算法骨架，将具体实现延迟到子类；策略模式则通过组合关系，将整个算法封装在独立的策略对象中，并可以动态替换。
- **工厂模式 (Factory Pattern)**：常与策略模式结合使用。客户端可以使用工厂模式来创建具体的策略对象，从而将对象的创建与使用解耦。

## 🚀 最佳实践

1. **合理使用工厂模式**：结合工厂模式来创建策略对象，避免客户端直接依赖具体策略类。
2. **策略枚举**：当策略较少且固定时，可以考虑使用枚举来管理和选择策略。
3. **缓存策略对象**：如果策略对象是无状态的（即不包含成员变量），可以将其设计为单例或使用缓存以减少对象创建的开销。
4. **提供默认策略**：为上下文提供一个默认策略，以避免在客户端未指定策略时出现空指针等问题，提高系统的健壮性。

```typescript
// 策略工厂示例
enum PaymentType {
    CREDIT_CARD = 'creditCard',
    ALIPAY = 'alipay',
    WECHAT = 'wechat'
}

class PaymentStrategyFactory {
    private static strategies = new Map<PaymentType, () => PaymentStrategy>();

    static {
        PaymentStrategyFactory.strategies.set(
            PaymentType.CREDIT_CARD, 
            () => new CreditCardPayment('**** **** **** 1234', 'Default User')
        );
        PaymentStrategyFactory.strategies.set(
            PaymentType.ALIPAY, 
            () => new AlipayPayment('default@example.com')
        );
        PaymentStrategyFactory.strategies.set(
            PaymentType.WECHAT, 
            () => new WechatPayment('13800138000')
        );
    }

    static createStrategy(type: PaymentType): PaymentStrategy {
        const factory = PaymentStrategyFactory.strategies.get(type);
        if (!factory) {
            throw new Error(`不支持的支付方式: ${type}`);
        }
        return factory();
    }
}

// 使用工厂创建策略
const strategy = PaymentStrategyFactory.createStrategy(PaymentType.ALIPAY);
```

## ⚠️ 注意事项

1. **避免过度设计**：不要在简单的逻辑或算法不易变化的场景中滥用策略模式，以免增加不必要的复杂度。
2. **管理策略可见性**：客户端需要知道所有可用的策略，这可能暴露不应由客户端直接管理的实现细节。可以结合工厂模式来隐藏具体策略类。
3. **性能权衡**：在性能敏感的场景中，需要评估因创建和切换策略对象而带来的开销。

## 📚 总结

策略模式提供了一种有效的解决方案来处理算法族的问题，它将算法的定义、创建和使用分离，使得算法可以独立于客户端变化。

**核心思想**：
- **封装变化**：将易于变化的算法封装在独立的策略类中。
- **组合优于继承**：通过对象组合的方式实现算法的动态切换。
- **面向接口编程**：上下文依赖于抽象的策略接口，而非具体的实现类。

**使用建议**：
- 当一个系统需要在多种算法中动态选择一种时。
- 当需要将业务逻辑与具体的算法实现解耦时。
- 当希望在不修改现有代码的情况下扩展新算法时。

总而言之，策略模式是实现开闭原则和依赖倒置原则的经典模式之一，在框架设计和业务开发中都有广泛的应用。

---

**相关链接**：
- [设计模式总览](../index.md)
- [状态模式](./state.md)
- [模板方法模式](./template-method.md)
